import { SchemaDirectiveVisitor } from 'apollo-server-express';
import { GraphQLField } from 'graphql';

import { throwIfNotGranted } from '../../Utils/Check';

export class AuthDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field: GraphQLField<any, any>) {
    const resolve = field.resolve;

    field.resolve = async (_source, args, ctx, info) => {
      throwIfNotGranted(ctx.user, this.args.roles);
      return resolve.apply(this, [_source, args, ctx, info]);
    };
  }
}
