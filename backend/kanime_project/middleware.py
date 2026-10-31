from django.core.exceptions import RequestDataTooBig
from django.conf import settings
from django.http import JsonResponse


class RequestSizeMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        content_length = request.META.get("CONTENT_LENGTH")

        if content_length:
            try:
                size = int(content_length)
            except (ValueError, TypeError):
                size = None

            if size is not None and size > settings.DATA_UPLOAD_MAX_MEMORY_SIZE:
                return JsonResponse(
                    {"error": "Request body exceeds the allowed size."},
                    status=413,
                )

        return self.get_response(request)
