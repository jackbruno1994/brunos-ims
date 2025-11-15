from brunos_ims.utils import add


def test_add_integers():
    assert add(1, 2) == 3


def test_add_floats():
    assert add(1.5, 2.5) == 4.0
