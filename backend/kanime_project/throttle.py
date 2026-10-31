from rest_framework.throttling import AnonRateThrottle


class LoginThrottle(AnonRateThrottle):
    scope = "login"


class SignupThrottle(AnonRateThrottle):
    scope = "signup"


class CatalogSearchThrottle(AnonRateThrottle):
    scope = "catalog_search"
