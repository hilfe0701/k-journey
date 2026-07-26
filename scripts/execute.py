#!/usr/bin/env python3
"""
Harness Step Executor — phase 내 step을 순차 실행하고 자가 교정한다.

Usage:
    python3 scripts/execute.py <phase-dir> [--push]
"""

import argparse
import contextlib
import json
import os
import subprocess
import sys
import threading
import time
import types
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Optional

ROOT = Path(__file__).resolve().parent.parent

# --- 실행기: Codex ---
# 원본 harness-framework 는 각 step 을 `claude -p` 로 띄운다.
# 이 프로젝트는 「계획은 Claude · 구현은 Codex」로 레인을 갈랐으므로 executor 를 codex 로 교체했다.
# 근거: k-journey/handoff.md 착수 브리프 (2026-07-27) · pm-job/AGENTS.md §1 codex exec 호출 규격.
# --skip-git-repo-check 는 넣지 않는다 — 그 플래그는 git 이 아닌 pm-job 용이고 이 저장소는 git 이다.
STEP_MODEL = os.environ.get("HARNESS_MODEL", "gpt-5.6-luna")
STEP_EFFORT = os.environ.get("HARNESS_EFFORT", "xhigh")
STEP_TIMEOUT = int(os.environ.get("HARNESS_TIMEOUT", "3600"))


@contextlib.contextmanager
def progress_indicator(label: str):
    """터미널 진행 표시기. with 문으로 사용하며 .elapsed 로 경과 시간을 읽는다."""
    frames = "◐◓◑◒"
    stop = threading.Event()
    t0 = time.monotonic()

    def _animate():
        idx = 0
        while not stop.wait(0.12):
            sec = int(time.monotonic() - t0)
            sys.stderr.write(f"\r{frames[idx % len(frames)]} {label} [{sec}s]")
            sys.stderr.flush()
            idx += 1
        sys.stderr.write("\r" + " " * (len(label) + 20) + "\r")
        sys.stderr.flush()

    th = threading.Thread(target=_animate, daemon=True)
    th.start()
    info = types.SimpleNamespace(elapsed=0.0)
    try:
        yield info
    finally:
        stop.set()
        th.join()
        info.elapsed = time.monotonic() - t0


class StepExecutor:
    """Phase 디렉토리 안의 step들을 순차 실행하는 하네스."""

    MAX_RETRIES = 3
    FEAT_MSG = "feat({phase}): step {num} — {name}"
    CHORE_MSG = "chore({phase}): step {num} output"
    TZ = timezone(timedelta(hours=9))

    def __init__(self, phase_dir_name: str, *, auto_push: bool = False):
        self._root = str(ROOT)
        self._phases_dir = ROOT / "phases"
        self._phase_dir = self._phases_dir / phase_dir_name
        self._phase_dir_name = phase_dir_name
        self._top_index_file = self._phases_dir / "index.json"
        self._auto_push = auto_push

        if not self._phase_dir.is_dir():
            print(f"ERROR: {self._phase_dir} not found")
            sys.exit(1)

        self._index_file = self._phase_dir / "index.json"
        if not self._index_file.exists():
            print(f"ERROR: {self._index_file} not found")
            sys.exit(1)

        idx = self._read_json(self._index_file)
        self._project = idx.get("project", "project")
        self._phase_name = idx.get("phase", phase_dir_name)
        self._total = len(idx["steps"])

    def run(self):
        self._print_header()
        self._check_blockers()
        self._warn_doc_drift()
        self._checkout_branch()
        self._ensure_created_at()
        self._execute_all_steps()
        self._finalize()

    # --- timestamps ---

    def _stamp(self) -> str:
        return datetime.now(self.TZ).strftime("%Y-%m-%dT%H:%M:%S%z")

    # --- JSON I/O ---

    @staticmethod
    def _read_json(p: Path) -> dict:
        return json.loads(p.read_text(encoding="utf-8"))

    @staticmethod
    def _write_json(p: Path, data: dict):
        p.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")

    # --- git ---

    def _run_git(self, *args) -> subprocess.CompletedProcess:
        cmd = ["git"] + list(args)
        return subprocess.run(cmd, cwd=self._root, capture_output=True, text=True)

    def _checkout_branch(self):
        branch = f"feat-{self._phase_name}"

        r = self._run_git("rev-parse", "--abbrev-ref", "HEAD")
        if r.returncode != 0:
            print(f"  ERROR: git을 사용할 수 없거나 git repo가 아닙니다.")
            print(f"  {r.stderr.strip()}")
            sys.exit(1)

        if r.stdout.strip() == branch:
            return

        r = self._run_git("rev-parse", "--verify", branch)
        r = self._run_git("checkout", branch) if r.returncode == 0 else self._run_git("checkout", "-b", branch)

        if r.returncode != 0:
            print(f"  ERROR: 브랜치 '{branch}' checkout 실패.")
            print(f"  {r.stderr.strip()}")
            print(f"  Hint: 변경사항을 stash하거나 commit한 후 다시 시도하세요.")
            sys.exit(1)

        print(f"  Branch: {branch}")

    def _commit_step(self, step_num: int, step_name: str):
        output_rel = f"phases/{self._phase_dir_name}/step{step_num}-output.json"
        index_rel = f"phases/{self._phase_dir_name}/index.json"

        self._run_git("add", "-A")
        self._run_git("reset", "HEAD", "--", output_rel)
        self._run_git("reset", "HEAD", "--", index_rel)

        if self._run_git("diff", "--cached", "--quiet").returncode != 0:
            msg = self.FEAT_MSG.format(phase=self._phase_name, num=step_num, name=step_name)
            r = self._run_git("commit", "-m", msg)
            if r.returncode == 0:
                print(f"  Commit: {msg}")
            else:
                print(f"  WARN: 코드 커밋 실패: {r.stderr.strip()}")

        self._run_git("add", "-A")
        if self._run_git("diff", "--cached", "--quiet").returncode != 0:
            msg = self.CHORE_MSG.format(phase=self._phase_name, num=step_num)
            r = self._run_git("commit", "-m", msg)
            if r.returncode != 0:
                print(f"  WARN: housekeeping 커밋 실패: {r.stderr.strip()}")

    # --- top-level index ---

    def _update_top_index(self, status: str):
        if not self._top_index_file.exists():
            return
        top = self._read_json(self._top_index_file)
        ts = self._stamp()
        for phase in top.get("phases", []):
            if phase.get("dir") == self._phase_dir_name:
                phase["status"] = status
                ts_key = {"completed": "completed_at", "error": "failed_at", "blocked": "blocked_at"}.get(status)
                if ts_key:
                    phase[ts_key] = ts
                break
        self._write_json(self._top_index_file, top)

    # --- guardrails & context ---
    #
    # 2026-07-27 (㈒①): `docs/*.md` 전체 글롭을 allowlist 로 교체했다.
    # 글롭이던 시절 주입량은 CLAUDE.md 29,547자 + docs 19종 152,615자 = 182,162자였고,
    # 개정된 CLAUDE.md 는 그 중 16.2% 뿐이었다. 나머지 83.8% 가 아직 로그인·패널 언락·
    # 갤러리·원격 sync 를 말한다 — 가드레일 안에서 길이가 이긴다.
    # 근거: .work/adr-dec-raw-v4.md §3 · .work/pmjob/k-journey/45-k-journey-adr-dec-reconciliation-2026-07-27.md
    #
    # 19 = 13 + 6 (`comm -23` 으로 확인). 「결론이 적힌 7건」과 「뒤집힘에 걸린 13건」은
    # 다르다 — 좁은 7건을 쓰면 docs/SECURITY.md 를 포함한 6건을 놓친다.

    #: 어느 「뒤집힘」 ADR 에도 걸리지 않는 6종. 모든 step 에 주입한다.
    BASE_DOCS = (
        "ACCESSIBILITY",
        "I18N_TIMEZONE",
        "MICROCOPY",
        "MONITORING",
        "PERFORMANCE",
        "RELEASE",
    )

    #: 「뒤집힘」 ADR 을 근거로 삼는 13종. 기본으로 주입하지 않는다.
    #: step 이 index.json 의 "docs" 로 명시 요청할 때만, 격리 경고를 머리에 붙여 주입한다.
    #: 값은 그 경고 문구다 — 통째로 빼는 것이 아니라 「어디까지 살아 있는지」를 함께 준다.
    LEGACY_DOCS = {
        "ANALYTICS_SCHEMA": "`sign_in`·`mission_complete`·`panel_unlock`·`byeongpung_share`·"
                            "`gallery_open`·`photo_upload_outcome` 은 뒤집힌 ADR 위에 있다. "
                            "조건 축 payload 는 **미확정** `DEC-027` 의존이다 — sink 배선만, payload·cohort 는 격리.",
        "EDGE_CASES": "auth·원격 sync 실패 모드 행은 `ADR-0006`·`0013`·`0014`·`0031` 위에 있다(뒤집힘). "
                      "그 밖의 feature × failure-mode 격자는 유효하다.",
        "EMPTY_STATES": "§§5–7(gallery·byeongpung)은 `DEC-024` 가 `Won't` 로 둔 `MEM-02`·`MEM-03` 전제다. "
                        "일반 3-slot empty-state 계약은 유효하다(`ADR-0027` 유효).",
        "ERROR_MESSAGES": "`auth-*`·`network-offline-recovered`·`bucket-conflict` 행은 걷어낸다"
                          "(`DEC-026` 삭제분 — **확정**). `save_failed`·`E8` 새 문구는 **미확정**이라 추가하지 않는다. "
                          "T1~T4 층위와 `showOperationError` 마스터 표는 유효하다.",
        "INCIDENT_RESPONSE": "계정·서버 사용자 데이터 사고 절차는 `DEC-001`·`DEC-022` 범위 밖이다. "
                             "사고 등급·연락 체계·사용자 고지 템플릿(§8.4-8.6)은 유효하다.",
        "OPERATIONS": "계정 문의·서버 운영 런북은 `DEC-001`·`DEC-022` 범위 밖이다. "
                      "운영 주체는 `38` §7 기준 `owner` 5칸 전부 `미확인`이다 — 값을 지어내지 마라.",
        "PLAY_DATA_SAFETY": "Email/Name/User IDs 수집·연결 고지와 in-app 계정 삭제는 `DEC-001`·`POL-001`·`POL-012` 와 어긋난다. "
                            "「Photos: not collected / no Firebase Storage」는 `ADR-0034` 제외의 보조 근거다.",
        "PRIVACY_POLICY": "계정·서버 보관 PII 절은 `ADR-0006`·`0013`·`0014`·`0021` 위에 있다(뒤집힘).",
        "PUSH_COPY": "panel unlock 타입·`claimPanelUnlock` 게이트·「sync fires panels」 문장은 legacy"
                     "(`ADR-0009` · `DEC-024`). D-Day·phase 로컬 알림 원칙은 유효하다.",
        "SECURITY": "계정·Firestore ACL 절은 `ADR-0021` 위에 있고 `DEC-001`·`DEC-022` 가 뒤집었다"
                    "(`firestore.rules` 의 per-user ACL 은 제거 대상이다). "
                    "위협 모델·비밀값 취급·키 로테이션 실무는 살아남는다 — DEC 가 명시적으로 바꾸지 않는 한 유효.",
        "SETTINGS": "**전체가 `ADR-0032` legacy 다.** §4 Account·Firestore/MMKV 미러·signed-in email·"
                    "`ADR-0033` soft-delete/export 는 유지할 수 없다. §1–§3 중 무엇이 로컬 설정으로 남는지는 "
                    "**새 DEC 가 필요하다 — 구현 step 안에서 결정하지 마라.**",
        "STORE_LISTING": "account-bound progress·sign-in required·리뷰어 계정은 `DEC-001` 과 정면으로 어긋난다. "
                         "스토어 등록 자체가 이번 범위 밖이다.",
        "TESTING": "auth·원격 sync 테스트 절은 뒤집힌 ADR 위에 있다. 테스트 규약·러너 설정·"
                   "사용성 체크리스트(§9)는 유효하다. 이번 구현의 `TC` 정본은 "
                   "`.work/pmjob/k-journey/30-k-journey-traceability-matrix-2026-07-25.md` 다.",
    }

    def _iter_doc_names(self, step: Optional[dict]) -> list:
        """이 step 에 주입할 docs 이름 목록. base 6종 + step 이 명시 요청한 것."""
        names = list(self.BASE_DOCS)
        for name in (step or {}).get("docs", []):
            if name not in names:
                names.append(name)
        return names

    def _warn_doc_drift(self):
        """allowlist 어디에도 없는 docs/*.md 가 생기면 조용히 빠진다. 소리를 내게 한다."""
        docs_dir = ROOT / "docs"
        if not docs_dir.is_dir():
            return
        known = set(self.BASE_DOCS) | set(self.LEGACY_DOCS)
        unknown = sorted(d.stem for d in docs_dir.glob("*.md") if d.stem not in known)
        if unknown:
            print(f"  WARN: allowlist 에 없는 docs/ 문서 {len(unknown)}건 — 주입되지 않는다: {', '.join(unknown)}")
            print(f"        BASE_DOCS 또는 LEGACY_DOCS 에 넣어 판정하라 (scripts/execute.py).")

    def _load_guardrails(self, step: Optional[dict] = None) -> str:
        sections = []
        claude_md = ROOT / "CLAUDE.md"
        if claude_md.exists():
            sections.append(f"## 프로젝트 규칙 (CLAUDE.md)\n\n{claude_md.read_text()}")

        docs_dir = ROOT / "docs"
        for name in self._iter_doc_names(step):
            doc = docs_dir / f"{name}.md"
            if not doc.exists():
                print(f"  WARN: docs/{name}.md 가 없다 — 주입하지 않는다")
                continue
            if name in self.LEGACY_DOCS:
                sections.append(
                    f"## {name} — ⛔ LEGACY (이 step 이 명시 요청함)\n\n"
                    f"> ⛔ **이 문서는 뒤집힌 ADR 위에 있다. 통째로 구현 근거로 쓰지 마라.**\n"
                    f"> {self.LEGACY_DOCS[name]}\n"
                    f"> 판정 근거: CLAUDE.md 의 Decision precedence 절.\n\n"
                    f"{doc.read_text()}"
                )
            else:
                sections.append(f"## {name}\n\n{doc.read_text()}")
        return "\n\n---\n\n".join(sections) if sections else ""

    @staticmethod
    def _build_step_context(index: dict) -> str:
        lines = [
            f"- Step {s['step']} ({s['name']}): {s['summary']}"
            for s in index["steps"]
            if s["status"] == "completed" and s.get("summary")
        ]
        if not lines:
            return ""
        return "## 이전 Step 산출물\n\n" + "\n".join(lines) + "\n\n"

    def _build_preamble(self, guardrails: str, step_context: str,
                        prev_error: Optional[str] = None) -> str:
        commit_example = self.FEAT_MSG.format(
            phase=self._phase_name, num="N", name="<step-name>"
        )
        retry_section = ""
        if prev_error:
            retry_section = (
                f"\n## ⚠ 이전 시도 실패 — 아래 에러를 반드시 참고하여 수정하라\n\n"
                f"{prev_error}\n\n---\n\n"
            )
        return (
            f"당신은 {self._project} 프로젝트의 개발자입니다. 아래 step을 수행하세요.\n\n"
            f"{guardrails}\n\n---\n\n"
            f"{step_context}{retry_section}"
            f"## 작업 규칙\n\n"
            f"1. 이전 step에서 작성된 코드를 확인하고 일관성을 유지하라.\n"
            f"2. 이 step에 명시된 작업만 수행하라. 추가 기능이나 파일을 만들지 마라.\n"
            f"3. 기존 테스트를 깨뜨리지 마라.\n"
            f"4. AC(Acceptance Criteria) 검증을 직접 실행하라.\n"
            f"5. /phases/{self._phase_dir_name}/index.json의 해당 step status를 업데이트하라:\n"
            f"   - AC 통과 → \"completed\" + \"summary\" 필드에 이 step의 산출물을 한 줄로 요약\n"
            f"   - {self.MAX_RETRIES}회 수정 시도 후에도 실패 → \"error\" + \"error_message\" 기록\n"
            f"   - 사용자 개입이 필요한 경우 (API 키, 인증, 수동 설정 등) → \"blocked\" + \"blocked_reason\" 기록 후 즉시 중단\n"
            f"6. 모든 변경사항을 커밋하라:\n"
            f"   {commit_example}\n\n---\n\n"
        )

    # --- Codex 호출 ---

    def _invoke_claude(self, step: dict, preamble: str) -> dict:
        step_num, step_name = step["step"], step["name"]
        step_file = self._phase_dir / f"step{step_num}.md"

        if not step_file.exists():
            print(f"  ERROR: {step_file} not found")
            sys.exit(1)

        last_msg = self._phase_dir / f"step{step_num}-last-message.txt"
        prompt = preamble + step_file.read_text()
        result = subprocess.run(
            [
                "codex", "exec",
                "-m", STEP_MODEL,
                "-c", f"model_reasoning_effort={STEP_EFFORT}",
                "-c", "tools.web_search=true",
                "-s", "workspace-write",
                "-C", str(self._root),
                "-o", str(last_msg),
                prompt,
            ],
            cwd=self._root, capture_output=True, text=True, timeout=STEP_TIMEOUT,
        )

        if result.returncode != 0:
            print(f"\n  WARN: Codex가 비정상 종료됨 (code {result.returncode})")
            if result.stderr:
                print(f"  stderr: {result.stderr[:500]}")

        output = {
            "step": step_num, "name": step_name,
            "exitCode": result.returncode,
            "stdout": result.stdout, "stderr": result.stderr,
        }
        out_path = self._phase_dir / f"step{step_num}-output.json"
        with open(out_path, "w") as f:
            json.dump(output, f, indent=2, ensure_ascii=False)

        return output

    # --- 헤더 & 검증 ---

    def _print_header(self):
        print(f"\n{'='*60}")
        print(f"  Harness Step Executor")
        print(f"  Phase: {self._phase_name} | Steps: {self._total}")
        if self._auto_push:
            print(f"  Auto-push: enabled")
        print(f"{'='*60}")

    def _check_blockers(self):
        index = self._read_json(self._index_file)
        for s in reversed(index["steps"]):
            if s["status"] == "error":
                print(f"\n  ✗ Step {s['step']} ({s['name']}) failed.")
                print(f"  Error: {s.get('error_message', 'unknown')}")
                print(f"  Fix and reset status to 'pending' to retry.")
                sys.exit(1)
            if s["status"] == "blocked":
                print(f"\n  ⏸ Step {s['step']} ({s['name']}) blocked.")
                print(f"  Reason: {s.get('blocked_reason', 'unknown')}")
                print(f"  Resolve and reset status to 'pending' to retry.")
                sys.exit(2)
            if s["status"] != "pending":
                break

    def _ensure_created_at(self):
        index = self._read_json(self._index_file)
        if "created_at" not in index:
            index["created_at"] = self._stamp()
            self._write_json(self._index_file, index)

    # --- 실행 루프 ---

    def _execute_single_step(self, step: dict) -> bool:
        """단일 step 실행 (재시도 포함). 완료되면 True, 실패/차단이면 False."""
        step_num, step_name = step["step"], step["name"]
        done = sum(1 for s in self._read_json(self._index_file)["steps"] if s["status"] == "completed")
        prev_error = None

        # 가드레일은 step 마다 다르다 — base 6종 + 이 step 이 index.json 의 "docs" 로 요청한 것.
        guardrails = self._load_guardrails(step)
        extra = [n for n in step.get("docs", []) if n not in self.BASE_DOCS]
        print(f"  Guardrails: CLAUDE.md + base {len(self.BASE_DOCS)}종"
              + (f" + legacy {len(extra)}종({', '.join(extra)})" if extra else "")
              + f" · {len(guardrails):,}자")

        for attempt in range(1, self.MAX_RETRIES + 1):
            index = self._read_json(self._index_file)
            step_context = self._build_step_context(index)
            preamble = self._build_preamble(guardrails, step_context, prev_error)

            tag = f"Step {step_num}/{self._total - 1} ({done} done): {step_name}"
            if attempt > 1:
                tag += f" [retry {attempt}/{self.MAX_RETRIES}]"

            with progress_indicator(tag) as pi:
                self._invoke_claude(step, preamble)
                elapsed = int(pi.elapsed)

            index = self._read_json(self._index_file)
            status = next((s.get("status", "pending") for s in index["steps"] if s["step"] == step_num), "pending")
            ts = self._stamp()

            if status == "completed":
                for s in index["steps"]:
                    if s["step"] == step_num:
                        s["completed_at"] = ts
                self._write_json(self._index_file, index)
                self._commit_step(step_num, step_name)
                print(f"  ✓ Step {step_num}: {step_name} [{elapsed}s]")
                return True

            if status == "blocked":
                for s in index["steps"]:
                    if s["step"] == step_num:
                        s["blocked_at"] = ts
                self._write_json(self._index_file, index)
                reason = next((s.get("blocked_reason", "") for s in index["steps"] if s["step"] == step_num), "")
                print(f"  ⏸ Step {step_num}: {step_name} blocked [{elapsed}s]")
                print(f"    Reason: {reason}")
                self._update_top_index("blocked")
                sys.exit(2)

            err_msg = next(
                (s.get("error_message", "Step did not update status") for s in index["steps"] if s["step"] == step_num),
                "Step did not update status",
            )

            if attempt < self.MAX_RETRIES:
                for s in index["steps"]:
                    if s["step"] == step_num:
                        s["status"] = "pending"
                        s.pop("error_message", None)
                self._write_json(self._index_file, index)
                prev_error = err_msg
                print(f"  ↻ Step {step_num}: retry {attempt}/{self.MAX_RETRIES} — {err_msg}")
            else:
                for s in index["steps"]:
                    if s["step"] == step_num:
                        s["status"] = "error"
                        s["error_message"] = f"[{self.MAX_RETRIES}회 시도 후 실패] {err_msg}"
                        s["failed_at"] = ts
                self._write_json(self._index_file, index)
                self._commit_step(step_num, step_name)
                print(f"  ✗ Step {step_num}: {step_name} failed after {self.MAX_RETRIES} attempts [{elapsed}s]")
                print(f"    Error: {err_msg}")
                self._update_top_index("error")
                sys.exit(1)

        return False  # unreachable

    def _execute_all_steps(self):
        while True:
            index = self._read_json(self._index_file)
            pending = next((s for s in index["steps"] if s["status"] == "pending"), None)
            if pending is None:
                print("\n  All steps completed!")
                return

            step_num = pending["step"]
            for s in index["steps"]:
                if s["step"] == step_num and "started_at" not in s:
                    s["started_at"] = self._stamp()
                    self._write_json(self._index_file, index)
                    break

            self._execute_single_step(pending)

    def _finalize(self):
        index = self._read_json(self._index_file)
        index["completed_at"] = self._stamp()
        self._write_json(self._index_file, index)
        self._update_top_index("completed")

        self._run_git("add", "-A")
        if self._run_git("diff", "--cached", "--quiet").returncode != 0:
            msg = f"chore({self._phase_name}): mark phase completed"
            r = self._run_git("commit", "-m", msg)
            if r.returncode == 0:
                print(f"  ✓ {msg}")

        if self._auto_push:
            branch = f"feat-{self._phase_name}"
            r = self._run_git("push", "-u", "origin", branch)
            if r.returncode != 0:
                print(f"\n  ERROR: git push 실패: {r.stderr.strip()}")
                sys.exit(1)
            print(f"  ✓ Pushed to origin/{branch}")

        print(f"\n{'='*60}")
        print(f"  Phase '{self._phase_name}' completed!")
        print(f"{'='*60}")


def main():
    parser = argparse.ArgumentParser(description="Harness Step Executor")
    parser.add_argument("phase_dir", help="Phase directory name (e.g. 0-mvp)")
    parser.add_argument("--push", action="store_true", help="Push branch after completion")
    args = parser.parse_args()

    StepExecutor(args.phase_dir, auto_push=args.push).run()


if __name__ == "__main__":
    main()
