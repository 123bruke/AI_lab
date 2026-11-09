from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import ExperimentRecord, LabNotebook, User
from ..schemas import ExperimentCreate, ExperimentOut, NotebookCreate, NotebookOut
from ..auth import require_current_user, get_current_user

router = APIRouter(prefix="/experiments", tags=["Experiments & Lab Records"])

@router.post("/save", response_model=ExperimentOut)
def save_experiment_state(
    exp_data: ExperimentCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    # If anonymous user, map to guest demo user or user id 1
    user_id = current_user.id if current_user else 1

    # Ensure a fallback default user exists if anonymous
    if not current_user:
        guest = db.query(User).filter(User.username == "guest_student").first()
        if not guest:
            from ..auth import hash_password
            guest = User(
                username="guest_student",
                email="guest@moseb.edu",
                hashed_password=hash_password("guest123"),
                full_name="Guest Scholar",
                role="student"
            )
            db.add(guest)
            db.commit()
            db.refresh(guest)
        user_id = guest.id

    new_record = ExperimentRecord(
        user_id=user_id,
        title=exp_data.title,
        notes=exp_data.notes,
        temperature=exp_data.temperature,
        volume_ml=exp_data.volume_ml,
        solute_name=exp_data.solute_name,
        fire_power=exp_data.fire_power,
        water_state=exp_data.water_state,
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record

@router.get("/history", response_model=List[ExperimentOut])
def get_user_experiments(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    user_id = current_user.id if current_user else 1
    return db.query(ExperimentRecord).filter(ExperimentRecord.user_id == user_id).order_by(ExperimentRecord.created_at.desc()).limit(20).all()

@router.post("/notebook", response_model=NotebookOut)
def create_notebook_entry(
    entry_data: NotebookCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_current_user)
):
    entry = LabNotebook(
        user_id=current_user.id,
        title=entry_data.title,
        hypothesis=entry_data.hypothesis,
        observations=entry_data.observations,
        conclusion=entry_data.conclusion,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@router.get("/notebook", response_model=List[NotebookOut])
def list_notebook_entries(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_current_user)
):
    return db.query(LabNotebook).filter(LabNotebook.user_id == current_user.id).order_by(LabNotebook.created_at.desc()).all()
