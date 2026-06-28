from app.schemas.task import MicroTask


def create_micro_tasks(title: str, estimated_minutes: int) -> list[MicroTask]:
    chunk_count = max(1, round(estimated_minutes / 15))
    verbs = ["Clarify", "Gather", "Draft", "Improve", "Finalize"]
    tasks: list[MicroTask] = []

    for index in range(chunk_count):
        verb = verbs[min(index, len(verbs) - 1)]
        tasks.append(
            MicroTask(
                title=f"{verb} {title}",
                estimated_minutes=15,
                order=index + 1,
            )
        )

    return tasks

