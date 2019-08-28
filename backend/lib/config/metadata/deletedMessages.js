module.exports = dependencies => {
  const { createValidator } = dependencies('esn-config').validator.helper;
  const schema = {
    type: 'object',
    properties: {
      restore: {
        isEnabled: { type: 'boolean' }
      }
    }
  };

  return {
    rights: {
      user: 'r',
      admin: 'rw',
      padmin: 'rw'
    },
    validator: createValidator(schema)
  };
};
