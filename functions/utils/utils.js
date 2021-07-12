// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getConstrainsError = (constraint) => {
  if (constraint) {
    const code = Object.keys(constraint)[0];
    return {
      code,
      message: constraint[code],
    };
  }
  return null;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getDefaultError = (error) => {
  return {
    code: "Unexpected",
    message: error,
  };
};

