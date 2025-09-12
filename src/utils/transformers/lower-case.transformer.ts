import { TransformFnParams } from 'class-transformer';
import { MaybeType } from '../types/maybe.type';

export const lowerCaseTransformer = (
  params: TransformFnParams,
): MaybeType<string> => {
  const value = params.value;
  return value ? value.toLowerCase() : value;
};
