import dynamoose from 'dynamoose';

const sequenceSchema = new dynamoose.Schema({
  sequenceName: {
    type: String,
    hashKey: true,
  },
  value: {
    type: Number,
    default: 0,
  },
});

const Sequence = dynamoose.model('Sequence', sequenceSchema);

export default Sequence;
