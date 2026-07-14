#!/usr/bin/env python3
"""Rename videos in originals/ and compressed/ to a unified format.

Format: YYYY_topic-slug_author-slug.mp4
Both folders use the same filename for each video pair.
"""

from __future__ import annotations

import os
import re
import shutil
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIGINALS = os.path.join(ROOT, "assets", "media", "originals")
COMPRESSED = os.path.join(ROOT, "assets", "media", "compressed")

# old filename -> canonical filename (same in both folders)
RENAME_MAP: dict[str, str] = {
    # originals (legacy names)
    "2021 DT system - Liqiao Xia.mp4": "2021_dt-system_liqiao-xia.mp4",
    "2022 Hand-object 6D pose estimation - Junming Fan.mp4": "2022_hand-object-6d-pose_junming-fan.mp4",
    "2022 Shufei.mp4": "2022_shufei_shufei-li.mp4",
    "2023 AR-assisted 3D modelling and interactive design - Yinyue.mp4": "2023_ar-assisted-3d-modelling_yinyue.mp4",
    "2023 Junming.mp4": "2023_junming_junming-fan.mp4",
    "2023 VR-assisted teleoperation and data acquisition- Ke Wan.mp4": "2023_vr-assisted-teleoperation_ke-wan.mp4",
    "2024 DRL-based motion planning and preview - Chengxi Li.mp4": "2024_drl-motion-planning_chengxi-li.mp4",
    "2025 AR引导的多模态交互与低代码机器人制孔系统 - Wenhang Dong.mp4": "2025_ar-guided-drilling_wenhang-dong.mp4",
    "2025 Glovity - 多模态数采手套 - Yuyang Gao.mp4": "2025_glovity_yuyang-gao.mp4",
    "2025 多传感器融合的自动化制孔过程实时监测 - LI Dongpeng.mp4": "2025_drilling-monitoring_li-dongpeng.mp4",
    "2025 废旧电池分拣人机协作系统 - Yuchen Ji.mp4": "2025_battery-sorting_yuchen-ji.mp4",
    "2025_tele-realman_MA_Haofei.mp4": "2025_tele-realman_ma-haofei.mp4",
    "2026 杭州人型机器人场景应用大赛ORCA仿真赛 - Ziqing Zhu.mp4": "2026_orca-simulation_ziqing-zhu.mp4",
    "2026_aero-manipulate_GAO_benhua.mp4": "2026_aero-manipulate_gao-benhua.mp4",
    "2026_cooland_ZHANG_Xi.mp4": "2026_cooland_zhang-xi.mp4",
    "2026_hkpc_BAO_Xurui.mp4": "2026_hkpc_bao-xurui.mp4",
    "2026_telex_GAO_Yuyang.mp4": "2026_telex_gao-yuyang.mp4",
    # compressed (legacy kebab-case or short names)
    "2021-dt-system-liqiao-xia.mp4": "2021_dt-system_liqiao-xia.mp4",
    "2022-hand-object-6d-pose-junming-fan.mp4": "2022_hand-object-6d-pose_junming-fan.mp4",
    "2022-shufei.mp4": "2022_shufei_shufei-li.mp4",
    "2023-ar-assisted-3d-modelling-yinyue.mp4": "2023_ar-assisted-3d-modelling_yinyue.mp4",
    "2023-junming.mp4": "2023_junming_junming-fan.mp4",
    "2023-vr-assisted-teleoperation-ke-wan.mp4": "2023_vr-assisted-teleoperation_ke-wan.mp4",
    "2024-drl-motion-planning-chengxi-li.mp4": "2024_drl-motion-planning_chengxi-li.mp4",
    "2025-ar-guided-drilling-wenhang-dong.mp4": "2025_ar-guided-drilling_wenhang-dong.mp4",
    "2025-glovity-yuyang-gao.mp4": "2025_glovity_yuyang-gao.mp4",
    "2025-drilling-monitoring-li-dongpeng.mp4": "2025_drilling-monitoring_li-dongpeng.mp4",
    "2025-battery-sorting-yuchen-ji.mp4": "2025_battery-sorting_yuchen-ji.mp4",
    "2025-tele-realman-ma-haofei.mp4": "2025_tele-realman_ma-haofei.mp4",
    "2026-orca-simulation-ziqing-zhu.mp4": "2026_orca-simulation_ziqing-zhu.mp4",
    "2026-aero-manipulate-gao-benhua.mp4": "2026_aero-manipulate_gao-benhua.mp4",
    "2026-cooland-zhang-xi.mp4": "2026_cooland_zhang-xi.mp4",
    "2026-hkpc-bao-xurui.mp4": "2026_hkpc_bao-xurui.mp4",
    "2026-telex-gao-yuyang.mp4": "2026_telex_gao-yuyang.mp4",
    # legacy short-name compressed duplicates (superseded by dated versions)
    "aero-manipulate.mp4": "2026_aero-manipulate_gao-benhua.mp4",
    "cooland.mp4": "2026_cooland_zhang-xi.mp4",
    "hkpc.mp4": "2026_hkpc_bao-xurui.mp4",
    "tele-realman.mp4": "2025_tele-realman_ma-haofei.mp4",
    "telex.mp4": "2026_telex_gao-yuyang.mp4",
}

# Files to delete (junk or exact duplicates after rename)
DELETE_FILES = {"_test-ke-wan.mp4"}


def finalize_temp_renames(folder: str, dry_run: bool = False) -> None:
    for name in os.listdir(folder):
        if not name.startswith("__renaming__") or not name.endswith(".mp4"):
            continue
        dst_name = name.removeprefix("__renaming__")
        src = os.path.join(folder, name)
        dst = os.path.join(folder, dst_name)
        print(f"{'[dry] ' if dry_run else ''}finalize: {name} -> {dst_name}")
        if dry_run:
            continue
        if os.path.exists(dst):
            os.remove(src)
        else:
            os.rename(src, dst)


def safe_rename(src: str, dst: str, dry_run: bool = False) -> bool:
    if dry_run:
        return True
    try:
        os.rename(src, dst)
        return True
    except OSError:
        try:
            shutil.copy2(src, dst)
            os.remove(src)
            return True
        except OSError as exc:
            print(f"FAILED: {os.path.basename(src)} -> {os.path.basename(dst)} ({exc})", file=sys.stderr)
            return False


def rename_in_folder(folder: str, dry_run: bool = False) -> None:
    if not os.path.isdir(folder):
        print(f"skip missing folder: {folder}")
        return

    finalize_temp_renames(folder, dry_run)

    # Two-pass rename via temp names to avoid collisions
    pending: list[tuple[str, str, str]] = []
    for name in sorted(os.listdir(folder)):
        if not name.endswith(".mp4") or name.startswith("__renaming__"):
            continue
        if name in DELETE_FILES:
            path = os.path.join(folder, name)
            print(f"{'[dry] ' if dry_run else ''}delete: {name}")
            if not dry_run:
                try:
                    os.remove(path)
                except OSError as exc:
                    print(f"FAILED delete: {name} ({exc})", file=sys.stderr)
            continue

        new_name = RENAME_MAP.get(name)
        if not new_name:
            if re.match(r"^\d{4}_[a-z0-9-]+_[a-z0-9-]+\.mp4$", name):
                print(f"already canonical: {name}")
                continue
            print(f"WARNING: no mapping for {name}", file=sys.stderr)
            continue
        if name == new_name:
            print(f"already canonical: {name}")
            continue

        src = os.path.join(folder, name)
        dst = os.path.join(folder, new_name)
        tmp = os.path.join(folder, f"__renaming__{new_name}")

        if os.path.exists(dst) and os.path.abspath(src) != os.path.abspath(dst):
            print(f"{'[dry] ' if dry_run else ''}remove duplicate: {name} (-> {new_name} exists)")
            if not dry_run:
                try:
                    os.remove(src)
                except OSError as exc:
                    print(f"FAILED remove duplicate: {name} ({exc})", file=sys.stderr)
            continue

        pending.append((src, tmp, dst))

    for src, tmp, dst in pending:
        print(f"{'[dry] ' if dry_run else ''}{os.path.basename(src)} -> {os.path.basename(dst)}")
        if dry_run:
            continue
        if os.path.exists(dst):
            os.remove(src)
            continue
        if not safe_rename(src, tmp):
            continue
    for src, tmp, dst in pending:
        if dry_run:
            continue
        if os.path.exists(tmp):
            safe_rename(tmp, dst)


def main() -> None:
    dry_run = "--dry-run" in sys.argv
    rename_in_folder(ORIGINALS, dry_run)
    rename_in_folder(COMPRESSED, dry_run)
    print("Done.")


if __name__ == "__main__":
    main()
