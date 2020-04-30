module.exports = {
  aws: {
    region: 'us-east-1', // e.g. us-east-1
    iot: {
      endpoint: 'a1jptnonqdwopx-ats.iot.us-east-1.amazonaws.com', // NOTE: get this value with `aws iot describe-endpoint`
    },
    cognito: {
      // Get it by running
      // aws cognito-identity list-identity-pools --max-results=5
      // {
      //   "IdentityPools": [
      //   {
      //     "IdentityPoolId": "<use this value>",
      //     "IdentityPoolName": <some name>
      //   }
      // ]
      // }
      identityPoolId: 'us-east-1:34a8a6ec-7665-4413-9e24-59ba8fbac415'
    }
  },
  topic: '/Yahtzee'
}
