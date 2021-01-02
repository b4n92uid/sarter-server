import { SchemaDirectiveVisitor, UserInputError } from "apollo-server-express";
import { GraphQLScalarType } from "graphql";

import { checkUploadPath } from "../../Utils/Uploads";

export class UploadDirective extends SchemaDirectiveVisitor {
  visitInputFieldDefinition(field) {
    this.wrapField(field);
  }
  visitFieldDefinition(field) {
    this.wrapField(field);
  }

  wrapField(field) {
    const uploadType = this.args.type;
    const initialType = field.type;
    field.type = new GraphQLScalarType({
      name: "UploadPath",

      serialize(value) {
        return initialType.serialize(value);
      },

      parseValue(value) {
        if (!checkUploadPath(uploadType, value))
          throw new UserInputError("Invalid upload reference");

        return initialType.parseValue(value);
      },

      parseLiteral(ast) {
        const value = initialType.parseLiteral(ast);

        if (!checkUploadPath(uploadType, value))
          throw new UserInputError("Invalid upload reference");

        return value;
      }
    });
  }
}
