# MOSEB STUDENT LAB - Backend Application Package
import sys
import types
from pathlib import Path

# Self-healing path & module aliasing for serverless/Vercel and monorepo environments
_current_dir = Path(__file__).resolve().parent
_backend_dir = _current_dir.parent
_workspace_dir = _backend_dir.parent

for _p in [str(_backend_dir), str(_workspace_dir)]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

if "backend" not in sys.modules:
    _backend_mod = types.ModuleType("backend")
    sys.modules["backend"] = _backend_mod
    import app as _app_mod
    _backend_mod.app = _app_mod
    sys.modules["backend.app"] = _app_mod
