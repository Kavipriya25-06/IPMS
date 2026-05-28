# # app_name/views.py
# from rest_framework.decorators import api_view
# from rest_framework.response import Response
# from rest_framework import status
# from new_app_structure.models import ToolInventory
# from .serializers import ToolInventorySerializer

# @api_view(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
# def tool_inventory(request, pk=None):
#     try:
#         if pk:
#             tool_item = ToolInventory.objects.get(pk=pk)
#     except ToolInventory.DoesNotExist:
#         return Response({"error": "Tool inventory item not found"}, status=status.HTTP_404_NOT_FOUND)

#     if request.method == 'GET':
#         if pk:
#             serializer = ToolInventorySerializer(tool_item)
#         else:
#             serializer = ToolInventorySerializer(ToolInventory.objects.all(), many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)

#     if request.method == 'POST':
#         serializer = ToolInventorySerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     if request.method in ['PUT', 'PATCH']:
#         serializer = ToolInventorySerializer(tool_item, data=request.data, partial=(request.method == 'PATCH'))
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     if request.method == 'DELETE':
#         tool_item.delete()
#         return Response({"message": "Deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from new_app_structure.models import ToolInventory, ToolInventoryEntry
from .serializers import (
    ToolInventorySerializer,
    ToolInventoryEntrySerializer,
    ToolInventoryEntryCreateSerializer,
)


@api_view(["GET", "POST"])
def tool_inventory(request):
    """
    GET  -> list tools
    POST -> create tool header (tool_id auto)
    """
    if request.method == "GET":
        qs = ToolInventory.objects.all().prefetch_related("entries").order_by("-created_at")
        serializer = ToolInventorySerializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # POST
    serializer = ToolInventorySerializer(data=request.data)
    if serializer.is_valid():
        tool = serializer.save()
        return Response(ToolInventorySerializer(tool).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
def tool_inventory_detail(request, pk):
    """
    /api/tool_inventory/<pk>/
    """
    try:
        tool = ToolInventory.objects.prefetch_related("entries").get(pk=pk)
    except ToolInventory.DoesNotExist:
        return Response({"error": "Tool not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        return Response(ToolInventorySerializer(tool).data, status=status.HTTP_200_OK)

    if request.method in ["PUT", "PATCH"]:
        serializer = ToolInventorySerializer(
            tool,
            data=request.data,
            partial=(request.method == "PATCH"),
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # DELETE
    tool.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET", "POST"])
def tool_inventory_entries(request):
    """
    POST -> create entry inside tool using tool_id
    GET  -> list entries
    """
    if request.method == "POST":
        serializer = ToolInventoryEntryCreateSerializer(data=request.data)
        if serializer.is_valid():
            entry = serializer.save()
            return Response(ToolInventoryEntrySerializer(entry).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # GET
    qs = (
        ToolInventoryEntry.objects
        .select_related("tool")           #     better for performance
        .order_by("-created_at")
    )
    return Response(ToolInventoryEntrySerializer(qs, many=True).data, status=status.HTTP_200_OK)


@api_view(["GET", "PATCH", "DELETE"])
def tool_inventory_entry_detail(request, pk):
    """
    /api/tool_inventory_entries/<pk>/
    GET    -> single entry
    PATCH  -> update entry (toggle status true/false, update vendor/price/gst/remarks)
    DELETE -> delete entry
    """
    try:
        entry = ToolInventoryEntry.objects.select_related("tool").get(pk=pk)
    except ToolInventoryEntry.DoesNotExist:
        return Response({"error": "Entry not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        return Response(ToolInventoryEntrySerializer(entry).data, status=status.HTTP_200_OK)

    if request.method == "PATCH":
        serializer = ToolInventoryEntrySerializer(entry, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()  # model.save() recalculates total_price
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # DELETE
    entry.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
