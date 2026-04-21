def schedule_next_review(stability: float, difficulty: float, last_interval_days: float) -> float:
    return max(1.0, last_interval_days * stability * (1.11 - difficulty * 0.1))
