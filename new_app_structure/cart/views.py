from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from new_app_structure.models import cart
from new_app_structure.cart.serializers import cart_serializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from new_app_structure.models import cart
from collections import defaultdict
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


@api_view(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
def group_by_vendor(request, id=None):
    if request.method == 'GET':
        if id:  # Retrieve a single record if `id` is provided
            try:
                obj = cart.objects.get(id=id)
            except cart.DoesNotExist:
                return Response({"error": "ID not found."}, status=status.HTTP_404_NOT_FOUND)

            response_data = {
                "vendor_id": obj.vendor_id,
                "vendor_name": obj.vendor_name,
                "order_placed": obj.order_placed,
                "requests": [
                    {
                        "component_id": obj.component_id,
                        "category": obj.category,
                        "component_type": obj.component_type,
                        "component_specification": obj.component_specification,
                        "unit_of_measurement": obj.unit_of_measurement,
                        "quantity": obj.quantity,
                        "unit_price": obj.unit_price,
                        "GST": obj.GST,
                        "total_cost": obj.total_cost,
                        "order_placed": obj.order_placed,
                        "id": obj.id,
                        "request_id": obj.request_id,
                        "request_list_id":obj.request_list_id,
                        "gstn": obj.gstn,
                        "date": obj.date.isoformat() if obj.date else None,
                    }
                ]
            }
            return Response(response_data, status=status.HTTP_200_OK)

        # Retrieve all records grouped by vendor_id, date, and order_placed
        vendors = cart.objects.values(
            'vendor_id',
            'vendor_name',
            'component_id',
            'category',
            'component_type',
            'component_specification',
            'unit_of_measurement',
            'quantity',
            'unit_price',
            'GST',
            'total_cost',
            'id',
            'order_placed',
            'date',
            'request_id',
            'request_list_id'
            # 'gstn'
        )

        if not vendors:  # If no data exists
            return Response({"message": "No data found."}, status=status.HTTP_404_NOT_FOUND)

        grouped_data = {}
        for item in vendors:
            vendor_id = item['vendor_id']
            vendor_name = item['vendor_name']
            order_placed = item['order_placed']
            date = item['date'].isoformat() if item['date'] else "Unknown"

            request_data = {
                "component_id": item['component_id'],
                "category": item['category'],
                "component_type": item['component_type'],
                "component_specification": item['component_specification'],
                "unit_of_measurement": item['unit_of_measurement'],
                "quantity": item['quantity'],
                "unit_price": item['unit_price'],
                "GST": item['GST'],
                "total_cost": item['total_cost'],
                "order_placed": item['order_placed'],
                "id": item['id'],
                "request_id": item['request_id'],
                "request_list_id":item['request_list_id']
                # "gstn": item['gstn'],
            }

            if vendor_id not in grouped_data:
                grouped_data[vendor_id] = {
                    "vendor_id": vendor_id,
                    "vendor_name": vendor_name,
                    "requests_by_date": {}
                }

            if date not in grouped_data[vendor_id]["requests_by_date"]:
                grouped_data[vendor_id]["requests_by_date"][date] = {}

            if order_placed not in grouped_data[vendor_id]["requests_by_date"][date]:
                grouped_data[vendor_id]["requests_by_date"][date][order_placed] = []

            grouped_data[vendor_id]["requests_by_date"][date][order_placed].append(request_data)

        response_data = list(grouped_data.values())
        return Response(response_data, status=status.HTTP_200_OK)

    elif request.method == 'POST':  # Create a new record
        serializer = cart_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'PUT':  # Full update
        try:
            obj = cart.objects.get(id=id)
        except cart.DoesNotExist:
            return Response({"error": "ID not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = cart_serializer(obj, data=request.data, partial=False)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'PATCH':  # Partial update
        try:
            obj = cart.objects.get(id=id)
        except cart.DoesNotExist:
            return Response({"error": "ID not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = cart_serializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':  # Delete a record
        try:
            obj = cart.objects.get(id=id)
        except cart.DoesNotExist:
            return Response({"error": "ID not found."}, status=status.HTTP_404_NOT_FOUND)

        obj.delete()
        return Response({"message": "Record deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

    return Response({"error": "Invalid request method."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
