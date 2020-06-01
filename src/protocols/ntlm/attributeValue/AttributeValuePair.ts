import AttributeValueId from "./AttributeValueId";

export default interface AttributeValuePair {
  id: AttributeValueId;
  buffer?: Buffer;
  value?: string | Date;
};