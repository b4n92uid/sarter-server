import { SchemaDirectiveVisitor } from "apollo-server-express";
import { GraphQLField } from "graphql";

import { logCrudAction } from "../../Utils/Check";

export class LogDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field: GraphQLField<any, any>) {
    const resolve = field.resolve;

    field.resolve = async (_source, args, ctx, info) => {
      logCrudAction(args, ctx, info);
      return resolve.apply(this, [_source, args, ctx, info]);
    };
  }
}
