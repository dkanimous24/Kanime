from rest_framework.throttling import AnonRateThrottle, SimpleRateThrottle
import logging

security_logger = logging.getLogger("kanime.security")


class ClientRateThrottling(SimpleRateThrottle):
    def get_cache_key(self, request, view):
        return self.cache_format % {
            "scope": self.scope,
            "ident": self.get_ident(request),
        }

    def throttle_failure(self):
        security_logger.warning(
            "Rate limit exceeded: %s",
            self.scope,
        )
        return False


class LoginThrottle(AnonRateThrottle):
    scope = "login"

    def throttle_failure(self):
        security_logger.warning("Rate limit exceeded: login")
        return False


class SignupThrottle(AnonRateThrottle):
    scope = "signup"


class CatalogSearchThrottle(AnonRateThrottle):
    scope = "catalog_search"
