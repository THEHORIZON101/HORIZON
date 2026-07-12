from math import floor


def has_close_elements(numbers: list[float], threshold: float) -> bool:
    """Return True when any distinct pair is closer than threshold."""
    return any(
        abs(numbers[i] - numbers[j]) < threshold
        for i in range(len(numbers))
        for j in range(i + 1, len(numbers))
    )


def separate_paren_groups(paren_string: str) -> list[str]:
    """Split a string of balanced parenthesis groups, ignoring spaces."""
    groups: list[str] = []
    current: list[str] = []
    depth = 0
    for char in paren_string:
        if char.isspace():
            continue
        current.append(char)
        depth += 1 if char == "(" else -1
        if depth == 0:
            groups.append("".join(current))
            current = []
    return groups


def truncate_number(number: float) -> float:
    """Return the fractional component of a positive floating-point number."""
    return number - floor(number)


def below_zero(operations: list[int]) -> bool:
    """Return True when the running account balance ever becomes negative."""
    balance = 0
    for operation in operations:
        balance += operation
        if balance < 0:
            return True
    return False


def mean_absolute_deviation(numbers: list[float]) -> float:
    """Return the mean absolute deviation from the arithmetic mean."""
    mean = sum(numbers) / len(numbers)
    return sum(abs(number - mean) for number in numbers) / len(numbers)

