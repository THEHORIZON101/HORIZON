from math import isclose

from solutions import (
    below_zero,
    has_close_elements,
    mean_absolute_deviation,
    separate_paren_groups,
    truncate_number,
)


def run_task(name, assertions):
    for assertion in assertions:
        assert assertion
    print(f"PASS {name}: {len(assertions)}/{len(assertions)} assertions")
    return len(assertions)


def main():
    total = 0
    total += run_task("HumanEval/0", [
        not has_close_elements([1.0, 2.0, 3.0], 0.5),
        has_close_elements([1.0, 2.8, 3.0, 4.0, 5.0, 2.0], 0.3),
        not has_close_elements([1.0, 2.0, 3.0], 0.0),
        has_close_elements([1.0, 1.0001], 0.001),
    ])
    total += run_task("HumanEval/1", [
        separate_paren_groups("( ) (( )) (( )( ))") == ["()", "(())", "(()())"],
        separate_paren_groups("() (()) ((()))") == ["()", "(())", "((()))"],
        separate_paren_groups("((()))") == ["((()))"],
        separate_paren_groups("") == [],
    ])
    total += run_task("HumanEval/2", [
        isclose(truncate_number(3.5), 0.5),
        isclose(truncate_number(1.33), 0.33),
        isclose(truncate_number(123.456), 0.456),
        isclose(truncate_number(7.0), 0.0),
    ])
    total += run_task("HumanEval/3", [
        not below_zero([1, 2, -3, 1, 2, -3]),
        below_zero([1, 2, -4, 5]),
        not below_zero([]),
        below_zero([-1]),
    ])
    total += run_task("HumanEval/4", [
        isclose(mean_absolute_deviation([1.0, 2.0, 3.0, 4.0]), 1.0),
        isclose(mean_absolute_deviation([1.0, 1.0, 1.0]), 0.0),
        isclose(mean_absolute_deviation([0.0, 10.0]), 5.0),
        isclose(mean_absolute_deviation([2.0, 4.0, 6.0]), 4.0 / 3.0),
    ])
    print(f"HumanEval public sample: 5/5 tasks passed, {total}/{total} assertions passed")


if __name__ == "__main__":
    main()

