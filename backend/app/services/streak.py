from datetime import datetime, timedelta, timezone


def touch_streak_on_activity(student, now: datetime | None = None) -> None:
    now = now or datetime.now(timezone.utc)
    last = student.last_activity_date
    if last is not None and last.tzinfo is None:
        last = last.replace(tzinfo=timezone.utc)
    today = now.date()
    if last is None:
        student.streak_days = max(1, student.streak_days or 0) or 1
    else:
        last_date = last.date()
        if last_date == today:
            student.last_activity_date = now
            return
        if last_date == today - timedelta(days=1):
            student.streak_days = (student.streak_days or 0) + 1
        else:
            student.streak_days = 1
    student.last_activity_date = now
