from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from new_app_structure.models import Outward, SalesItem, EventItem

from .serializers import (
    DefectsOutwardSerializer,
    ManufactureOutwardSerializer,
    SalesOutwardSerializer,
    EventOutwardSerializer,
    SalesItemSerializer,
    EventItemSerializer,
)

@api_view(['GET', 'POST'])
def outward_defects_view(request):
    if request.method == 'GET':
        qs = Outward.objects.filter(category="Defects").order_by('-date', '-time')
        return Response(DefectsOutwardSerializer(qs, many=True).data)
    ser = DefectsOutwardSerializer(data=request.data)
    if ser.is_valid():
        obj = ser.save()
        return Response(DefectsOutwardSerializer(obj).data, status=status.HTTP_201_CREATED)
    return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
def outward_manufacture_view(request):
    if request.method == 'GET':
        qs = Outward.objects.filter(category="Manufacture").order_by('-date', '-time')
        return Response(ManufactureOutwardSerializer(qs, many=True).data)
    ser = ManufactureOutwardSerializer(data=request.data)
    if ser.is_valid():
        obj = ser.save()
        return Response(ManufactureOutwardSerializer(obj).data, status=status.HTTP_201_CREATED)
    return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
def outward_sales_view(request):
    if request.method == 'GET':
        qs = Outward.objects.filter(category="Sales").order_by('-date', '-time')
        return Response(SalesOutwardSerializer(qs, many=True).data)
    ser = SalesOutwardSerializer(data=request.data)
    if ser.is_valid():
        obj = ser.save()
        return Response(SalesOutwardSerializer(obj).data, status=status.HTTP_201_CREATED)
    return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
def outward_event_view(request):
    if request.method == 'GET':
        qs = Outward.objects.filter(category="Event").order_by('-date', '-time')
        return Response(EventOutwardSerializer(qs, many=True).data)
    ser = EventOutwardSerializer(data=request.data)
    if ser.is_valid():
        obj = ser.save()
        return Response(EventOutwardSerializer(obj).data, status=status.HTTP_201_CREATED)
    return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def outward_defects_detail_view(request, id):
    outward = get_object_or_404(Outward, pk=id, category="Defects")
    if request.method == 'GET':
        return Response(DefectsOutwardSerializer(outward).data)

    if request.method == 'PUT':
        ser = DefectsOutwardSerializer(outward, data=request.data)  # full update
        if ser.is_valid():
            ser.save()
            return Response(ser.data)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'PATCH':
        ser = DefectsOutwardSerializer(outward, data=request.data, partial=True)  # partial update
        if ser.is_valid():
            ser.save()
            return Response(ser.data)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

    # DELETE
    outward.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def outward_manufacture_detail_view(request, id):
    outward = get_object_or_404(Outward, pk=id, category="Manufacture")
    if request.method == 'GET':
        return Response(ManufactureOutwardSerializer(outward).data)

    if request.method == 'PUT':
        ser = ManufactureOutwardSerializer(outward, data=request.data)  # full update
        if ser.is_valid():
            ser.save()
            return Response(ser.data)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'PATCH':
        ser = ManufactureOutwardSerializer(outward, data=request.data, partial=True)  # partial update
        if ser.is_valid():
            ser.save()
            return Response(ser.data)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

    # DELETE
    outward.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)



@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def outward_event_detail_view(request, id):
    outward = get_object_or_404(Outward, pk=id, category="Event")
    if request.method == 'GET':
        return Response(EventOutwardSerializer(outward).data)

    if request.method == 'PUT':
        ser = EventOutwardSerializer(outward, data=request.data)  # full update
        if ser.is_valid():
            ser.save()
            return Response(ser.data)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'PATCH':
        ser = EventOutwardSerializer(outward, data=request.data, partial=True)  # partial update
        if ser.is_valid():
            ser.save()
            return Response(ser.data)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

    # DELETE
    outward.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def outward_sales_detail_view(request, id):
    outward = get_object_or_404(Outward, pk=id, category="Sales")
    if request.method == 'GET':
        return Response(SalesOutwardSerializer(outward).data)

    if request.method == 'PUT':
        ser = SalesOutwardSerializer(outward, data=request.data)  # full update
        if ser.is_valid():
            ser.save()
            return Response(ser.data)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'PATCH':
        ser = SalesOutwardSerializer(outward, data=request.data, partial=True)  # partial update
        if ser.is_valid():
            ser.save()
            return Response(ser.data)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

    # DELETE
    outward.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
def outward_sales_items_view(request, id):
    outward = get_object_or_404(Outward, pk=id, category="Sales")
    if request.method == 'GET':
        items = outward.sales_items.all().order_by('id')
        return Response(SalesItemSerializer(items, many=True).data)
    payload = request.data
    if isinstance(payload, dict):
        payload = [payload]
    created, errors = [], []
    for idx, item in enumerate(payload):
        ser = SalesItemSerializer(data=item)
        if ser.is_valid():
            created.append(SalesItem.objects.create(outward=outward, **ser.validated_data))
        else:
            errors.append({"index": idx, "errors": ser.errors})
    if errors:
        return Response({"created": SalesItemSerializer(created, many=True).data, "errors": errors},
                        status=status.HTTP_207_MULTI_STATUS)
    return Response(SalesItemSerializer(created, many=True).data, status=status.HTTP_201_CREATED)

@api_view(['GET', 'PATCH', 'DELETE'])
def outward_sales_item_detail_view(request, id, item_id):
    outward = get_object_or_404(Outward, pk=id, category="Sales")
    item = get_object_or_404(SalesItem, pk=item_id, outward=outward)
    if request.method == 'GET':
        return Response(SalesItemSerializer(item).data)
    if request.method == 'PATCH':
        ser = SalesItemSerializer(item, data=request.data, partial=True)
        if ser.is_valid():
            ser.save()
            return Response(ser.data)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
    item.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST'])
def outward_event_items_view(request, id):
    outward = get_object_or_404(Outward, pk=id, category="Event")
    if request.method == 'GET':
        items = outward.event_items.all().order_by('id')
        return Response(EventItemSerializer(items, many=True).data)
    payload = request.data
    if isinstance(payload, dict):
        payload = [payload]
    created, errors = [], []
    for idx, item in enumerate(payload):
        ser = EventItemSerializer(data=item)
        if ser.is_valid():
            created.append(EventItem.objects.create(outward=outward, **ser.validated_data))
        else:
            errors.append({"index": idx, "errors": ser.errors})
    if errors:
        return Response({"created": EventItemSerializer(created, many=True).data, "errors": errors},
                        status=status.HTTP_207_MULTI_STATUS)
    return Response(EventItemSerializer(created, many=True).data, status=status.HTTP_201_CREATED)

@api_view(['GET', 'PATCH', 'DELETE'])
def outward_event_item_detail_view(request, id, item_id):
    outward = get_object_or_404(Outward, pk=id, category="Event")
    item = get_object_or_404(EventItem, pk=item_id, outward=outward)
    if request.method == 'GET':
        return Response(EventItemSerializer(item).data)
    if request.method == 'PATCH':
        ser = EventItemSerializer(item, data=request.data, partial=True)
        if ser.is_valid():
            ser.save()
            return Response(ser.data)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
    item.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
