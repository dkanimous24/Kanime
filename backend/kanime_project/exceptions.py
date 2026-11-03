from rest_framework.views import exception_handler
from rest_framework.exceptions import APIException
from rest_framework.response import Response
import logging

security_logger = logging.getLogger("kanime.security")


class AnimeServiceUnavailable(APIException):
    status_code = 503
    default_detail = "Anime service temporarily unavailable."
    default_code = "service_unavailable"


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    response = exception_handler(exc, context)

    if response is None:
        security_logger.error(
            "Unexpected backend failure: %s",
            type(exc).__name__,
        )

        return Response(
            {
                "error": {
                    "code": "internal_server_error",
                    "message": "An unexpected server error occurred.",
                }
            },
            status=500,
        )

    original_data = response.data

    if isinstance(original_data, dict):
        message = original_data.get("detail", "request failed")
    else:
        message = "Request Failed"

    if isinstance(message, (list, dict)):
        message = "Please check the submitted information."

    response.data = {
        "error": {
            "code": getattr(exc, "default_code", "error"),
            "message": str(message),
        }
    }

    if response.status_code == 400:
        response.data["error"]["fields"] = original_data

    return response


from rest_framework.exceptions import APIException


class InvalidLoginCredentials(APIException):
    status_code = 401
    default_detail = "Invalid username or password."
    default_code = "invalid_credentials"
