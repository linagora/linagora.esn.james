module.exports = dependencies => {
  const { createValidator } = dependencies('esn-config').validator.helper;

  const schema = {
    type: 'array',
    minItems: 0,
    items: {
      required: [
        'id',
        'expression'
      ],
      additionalProperties: false,
      properties: {
        id: {
          type: 'string'
        },
        expression: {
          type: 'string'
        },
        explanation: {
          type: 'string'
        },
        targetsSender: {
          type: 'boolean'
        },
        targetsRecipients: {
          type: 'boolean'
        },
        targetsContent: {
          type: 'boolean'
        }
      }
    }
  };

  return {
    validator: createValidator(schema)
  };
};
