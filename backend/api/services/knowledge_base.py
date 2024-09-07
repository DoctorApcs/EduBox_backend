from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from src.database.manager import DatabaseManager
from api.models.knowledge_base import (
    KnowledgeBaseCreate,
    KnowledgeBaseUpdate,
    KnowledgeBaseResponse,
)
from src.database.models import KnowledgeBase, Lesson
from src.dependencies import get_db_manager
from typing import List, Dict


class KnowledgeBaseService:
    def __init__(self, db_manager: DatabaseManager = Depends(get_db_manager)):
        self.db_manager = db_manager

    def create_knowledge_base(
        self, user_id: int, kb: KnowledgeBaseCreate
    ) -> KnowledgeBaseResponse:
        with self.db_manager.Session() as session:
            new_kb = KnowledgeBase(
                user_id=user_id, name=kb.name, description=kb.description
            )
            session.add(new_kb)
            session.commit()
            session.refresh(new_kb)
            return KnowledgeBaseResponse.model_validate(new_kb)

    def get_knowledge_base(self, kb_id: int, user_id: int) -> KnowledgeBaseResponse:
        with self.db_manager.Session() as session:
            kb = (
                session.query(KnowledgeBase)
                .options(joinedload(KnowledgeBase.documents))
                .filter_by(id=kb_id, user_id=user_id)
                .first()
            )
            if kb:
                return KnowledgeBaseResponse.model_validate(kb)
            return None

    def list_knowledge_bases(self, user_id: int) -> list[KnowledgeBaseResponse]:
        with self.db_manager.Session() as session:
            kbs = session.query(KnowledgeBase).filter_by(user_id=user_id).all()
            return [KnowledgeBaseResponse.model_validate(kb) for kb in kbs]

    def update_knowledge_base(
        self, kb_id: int, user_id: int, kb_update: KnowledgeBaseUpdate
    ) -> KnowledgeBaseResponse:
        with self.db_manager.Session() as session:
            kb = (
                session.query(KnowledgeBase)
                .filter_by(id=kb_id, user_id=user_id)
                .first()
            )
            if not kb:
                raise HTTPException(status_code=404, detail="Knowledge base not found")

            for key, value in kb_update.model_dump(exclude_unset=True).items():
                setattr(kb, key, value)

            session.commit()
            session.refresh(kb)
            return KnowledgeBaseResponse.model_validate(kb)

    def delete_knowledge_base(self, kb_id: int, user_id: int) -> bool:
        with self.db_manager.Session() as session:
            kb = (
                session.query(KnowledgeBase)
                .filter_by(id=kb_id, user_id=user_id)
                .first()
            )
            if not kb:
                return False
            session.delete(kb)
            session.commit()
            return True

    # API to start a session (when user clicks on a course and start learning)
    def start_session(self, user_id: int, knowledge_base_id: int):
        return self.db_manager.start_session(user_id, knowledge_base_id)

    # API to end a session (when user change course or finish learning)
    def end_session(self, session_id: int):
        return self.db_manager.end_session(session_id)

    # API to get the today's session of a user
    def get_today_sessions(self, user_id: int):
        return self.db_manager.get_today_session(user_id)

    # API to get this week's session of a user
    def get_this_week_sessions(self, user_id: int):
        return self.db_manager.get_this_week_session(user_id)

    def create_lesson(
        self, kb_id: int, user_id: int, title: str, content: str
    ) -> Lesson:
        with self.db_manager.Session() as session:
            kb = (
                session.query(KnowledgeBase)
                .filter_by(id=kb_id, user_id=user_id)
                .first()
            )
            if not kb:
                raise HTTPException(status_code=404, detail="Knowledge base not found")

            # Get the highest order value for existing lessons
            max_order = (
                session.query(Lesson.order)
                .filter_by(knowledge_base_id=kb_id)
                .order_by(Lesson.order.desc())
                .first()
            )
            new_order = (max_order[0] + 1) if max_order else 1

            new_lesson = Lesson(
                knowledge_base_id=kb_id, title=title, content=content, order=new_order
            )
            session.add(new_lesson)
            session.commit()
            session.refresh(new_lesson)
            return new_lesson

    def create_lessons(
        self, kb_id: int, user_id: int, lessons: List[Dict[str, str]]
    ) -> List[Lesson]:
        with self.db_manager.Session() as session:
            kb = (
                session.query(KnowledgeBase)
                .filter_by(id=kb_id, user_id=user_id)
                .first()
            )
            if not kb:
                raise HTTPException(status_code=404, detail="Knowledge base not found")

            # Get the highest order value for existing lessons
            max_order = (
                session.query(Lesson.order)
                .filter_by(knowledge_base_id=kb_id)
                .order_by(Lesson.order.desc())
                .first()
            )
            new_order = (max_order[0] if max_order else 0) + 1

            new_lessons = []
            for lesson_dict in lessons:
                for title, content in lesson_dict.items():
                    new_lesson = Lesson(
                        knowledge_base_id=kb_id,
                        title=title,
                        content=content,
                        order=new_order,
                    )
                    session.add(new_lesson)
                    new_lessons.append(new_lesson)
                    new_order += 1

            session.commit()
            for lesson in new_lessons:
                session.refresh(lesson)
            return new_lessons
