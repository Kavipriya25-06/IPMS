from urllib import request
from rest_framework.response import Response
from new_app_structure.QC_answers.serializers import qc_answer_serializer, qc_return_answer_serializer
from new_app_structure.models import qc_answer, qc_return_answer
from rest_framework.decorators import api_view


from rest_framework import status

@api_view(['GET','POST','PUT','PATCH', 'DELETE'])

def qc_answer_tables(request,id=None):

    """
    Handle HTTP requests for qc_answer tables.

    Supports the following methods:
    - GET: Retrieve a specific qc_answer by ID or a list of all qc_answers.
    - POST: Create a new qc_answer with the provided data.
    - PUT: Update an existing qc_answer specified by ID with the provided data.
    - PATCH: Partially update an existing qc_answer specified by ID.
    - DELETE: Delete the qc_answer specified by ID.

    Args:
        request: The HTTP request object containing method and data.
        id: Optional; The ID of the qc_answer to retrieve, update, or delete.

    Returns:
        A Response object with serialized data for GET, POST, PUT, and PATCH requests,
        or a success/error message for DELETE requests, along with an appropriate HTTP status code.
    """

    if request.method == 'GET':
        if id:
            try:
                obj = qc_answer.objects.get(id=id)
                serializer = qc_answer_serializer(obj)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except qc_answer.DoesNotExist:
                return Response({"error": "ID not found."}, status=status.HTTP_404_NOT_FOUND)
        else:
            objs = qc_answer.objects.all()
            serializer = qc_answer_serializer(objs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

    if request.method =='POST':
        data=request.data
        serializers=qc_answer_serializer(data=data)
        if serializers.is_valid():
            serializers.save()
            return Response(serializers.data)
        return Response(serializers.errors)

    if request.method=='PUT':
        data=request.data
        obj=qc_answer.objects.get(id=id)
        serializer=qc_answer_serializer(obj,data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_200_OK)

        else:
            return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method=='PATCH':
        data=request.data
        obj=qc_answer.objects.get(id=id)
        serializer=qc_answer_serializer(obj,data=data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_200_OK)

        else:
            return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        try:
            obj = qc_answer.objects.get(id=id)
            obj.delete()
            return Response({"message": " entry deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except qc_answer.DoesNotExist:
            return Response({"error": "ID not found."}, status=status.HTTP_404_NOT_FOUND)


@api_view(["GET", "POST", "PUT", "PATCH", "DELETE"])
def qc_return_answer_tables(request, id=None):
    """
    Handle HTTP requests for qc_return_answer tables.

    Supports the following methods:
    - GET: Retrieve a specific qc_return_answer by ID or a list of all qc_return_answers.
    - POST: Create a new qc_return_answer with the provided data.
    - PUT: Update an existing qc_return_answer specified by ID with the provided data.
    - PATCH: Partially update an existing qc_return_answer specified by ID.
    - DELETE: Delete the qc_return_answer specified by ID.

    Args:
        request: The HTTP request object containing method and data.
        id: Optional; The ID of the qc_return_answer to retrieve, update, or delete.

    Returns:
        A Response object with serialized data for GET, POST, PUT, and PATCH requests,
        or a success/error message for DELETE requests, along with an appropriate HTTP status code.
    """

    if request.method == "GET":
        if id:
            try:
                obj = qc_return_answer.objects.get(id=id)
                serializer = qc_return_answer_serializer(obj)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except qc_return_answer.DoesNotExist:
                return Response(
                    {"error": "ID not found."}, status=status.HTTP_404_NOT_FOUND
                )
        else:
            objs = qc_return_answer.objects.all()
            serializer = qc_return_answer_serializer(objs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

    if request.method == "POST":
        data = request.data
        serializers = qc_return_answer_serializer(data=data)
        if serializers.is_valid():
            serializers.save()
            return Response(serializers.data)
        return Response(serializers.errors)

    if request.method == "PUT":
        data = request.data
        obj = qc_return_answer.objects.get(id=id)
        serializer = qc_return_answer_serializer(obj, data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        else:
            return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == "PATCH":
        data = request.data
        obj = qc_return_answer.objects.get(id=id)
        serializer = qc_return_answer_serializer(obj, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        else:
            return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == "DELETE":
        try:
            obj = qc_return_answer.objects.get(id=id)
            obj.delete()
            return Response(
                {"message": " entry deleted successfully."},
                status=status.HTTP_204_NO_CONTENT,
            )
        except qc_return_answer.DoesNotExist:
            return Response(
                {"error": "ID not found."}, status=status.HTTP_404_NOT_FOUND
            )
