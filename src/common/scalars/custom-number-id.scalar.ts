import { GraphQLScalarType, Kind } from 'graphql';

function validateNumberId(id: unknown): number | never {
  if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
    throw new Error('Invalid ID: ID must be a positive integer.');
  }
  return id;
}

export const CustomNumberIdScalar = new GraphQLScalarType<number, number>({
  name: 'CustomID',
  description: 'A custom scalar to handle numeric IDs as integers',

  // Ensures outgoing value is a number
  serialize(value: unknown): number {
    return validateNumberId(value);
  },

  // Ensures incoming value (variables or input) is a number
  parseValue(value: unknown): number {
    return validateNumberId(value);
  },

  // Ensures incoming literal (in inline GraphQL queries) is a number
  parseLiteral(ast): number {
    if (ast.kind !== Kind.INT) {
      throw new Error('CustomID must be an integer.');
    }
    return validateNumberId(parseInt(ast.value, 10));
  },
});
