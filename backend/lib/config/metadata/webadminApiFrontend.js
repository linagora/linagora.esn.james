module.exports = dependencies => {
  const { createValidator } = dependencies('esn-config').validator.helper;
  const schema = {
    type: 'string',
    format: 'uri'
  };

  return {
    rights: {
      user: 'r',
      admin: 'r',
      padmin: 'rw'
    },
    validator: createValidator(schema)
  };
};
