import Logger from "@/Utils/Logger";
import { SchemaDirectiveVisitor } from "apollo-server-express";
import { GraphQLField } from "graphql";

export class LogDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field: GraphQLField<any, any>) {
    const resolve = field.resolve;

    field.resolve = async (_source, args, ctx, info) => {
      if (ctx.user) {
        Logger.query.debug(
          `@${ctx.user.username} ${info.fieldName} ${JSON.stringify(args)}`
        );
      } else {
        Logger.query.debug(
          `@anonymous ${info.fieldName} ${JSON.stringify(args)}`
        );
      }

      return resolve.apply(this, [_source, args, ctx, info]);
    };
  }
}
