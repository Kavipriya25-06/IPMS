from rest_framework import serializers
from new_app_structure.models import qc_question, qc_component_type


class qc_serializer(serializers.ModelSerializer):
    # Human-readable string in responses
    component_type = serializers.CharField(
        source='component_type.component_type',
        read_only=True
    )

    # Option 1 for writes: pass the FK id
    component_type_id = serializers.PrimaryKeyRelatedField(
        queryset=qc_component_type.objects.all(),
        source='component_type',
        write_only=True,
        required=False,          # <- was True
        allow_null=True,
    )

    # Option 2 for writes: pass the name (or keep using "component_type" in payload)
    component_type_name = serializers.CharField(
        write_only=True,
        required=False
    )

    class Meta:
        model = qc_question
        fields = ['id', 'component_type', 'component_type_id', 'component_type_name', 'question']

    def _get_or_create_component_type(self, name: str) -> qc_component_type:
        name = (name or '').strip()
        if not name:
            raise serializers.ValidationError({'component_type': 'Provide a non-empty component type name.'})

        # Case-insensitive lookup to avoid duplicates like "battery" vs "Battery"
        existing = qc_component_type.objects.filter(component_type__iexact=name).first()
        if existing:
            return existing
        return qc_component_type.objects.create(component_type=name)

    def validate(self, attrs):
        # If no FK object (via component_type_id) was provided,
        # ensure we at least have a name in the original payload.
        if 'component_type' not in attrs:
            name = self.initial_data.get('component_type_name') or self.initial_data.get('component_type')
            if not name:
                raise serializers.ValidationError({
                    'component_type': 'Provide component_type_id or component_type (name).'
                })
        return attrs

    def create(self, validated_data):
        comp_obj = validated_data.pop('component_type', None)

        # If no FK provided, resolve from name in the original payload
        if comp_obj is None:
            name = self.initial_data.get('component_type_name') or self.initial_data.get('component_type')
            comp_obj = self._get_or_create_component_type(name)

        return qc_question.objects.create(component_type=comp_obj, **validated_data)

    def update(self, instance, validated_data):
        comp_obj = validated_data.pop('component_type', None)
        if comp_obj is None:
            # allow updating via name too
            name = self.initial_data.get('component_type_name') or self.initial_data.get('component_type')
            if name:
                comp_obj = self._get_or_create_component_type(name)

        if comp_obj is not None:
            instance.component_type = comp_obj

        instance.question = validated_data.get('question', instance.question)
        instance.save()
        return instance

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Hide write-only helpers in responses
        data.pop('component_type_id', None)
        data.pop('component_type_name', None)
        return data
