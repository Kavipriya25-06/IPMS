from rest_framework.response import Response
from new_app_structure.models import qc_component_type
from rest_framework.decorators import api_view
from new_app_structure.QC_componet_type.serializer import qc_component_type_question_serializer
from rest_framework import status


@api_view(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
def qc_component_type_view(request, id=None):
    if request.method == 'GET':
        if id:
            try:
                obj = qc_component_type.objects.get(id=id)
                serializer = qc_component_type_question_serializer(obj)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except qc_component_type.DoesNotExist:
                return Response({"error": "ID not found."}, status=status.HTTP_404_NOT_FOUND)
        else:
            objs = qc_component_type.objects.all()
            serializer = qc_component_type_question_serializer(objs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        serializer = qc_component_type_question_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'PUT':
        if not id:
            return Response({"error": "ID is required for updating."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            obj = qc_component_type.objects.get(id=id)
            serializer = qc_component_type_question_serializer(obj, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except qc_component_type.DoesNotExist:
            return Response({"error": "ID not found."}, status=status.HTTP_404_NOT_FOUND)

    elif request.method == 'PATCH':
        if not id:
            return Response({"error": "ID is required for partial updating."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            obj = qc_component_type.objects.get(id=id)
            serializer = qc_component_type_question_serializer(obj, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except qc_component_type.DoesNotExist:
            return Response({"error": "ID not found."}, status=status.HTTP_404_NOT_FOUND)

    elif request.method == 'DELETE':
        if not id:
            return Response({"error": "ID is required for deletion."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            obj = qc_component_type.objects.get(id=id)
            obj.delete()
            return Response({"message": "Entry deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except qc_component_type.DoesNotExist:
            return Response({"error": "ID not found."}, status=status.HTTP_404_NOT_FOUND)
