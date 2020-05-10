const functions = require('firebase-functions');
const admin = require('firebase-admin');
const request = require('graphql-request');

admin.initializeApp(functions.config().firebase);

const client = new request.GraphQLClient(
  'https://fire-auth.herokuapp.com/v1/graphql',
  {
    headers: {
      'content-type': 'application/json',
      'x-hasura-admin-secret': 'password1',
    },
  }
);

// This again is automatically triggered
// whenever an account is deleted on Firebase
exports.processDelete = functions.auth.user().onDelete(async (user) => {
  const mutation = `
    mutation($id: String!) {
      delete_users(where: {id: {_eq: $id}}) {
        affected_rows
      }
    }
  `;
  const id = user.uid;

  try {
    const data = await client.request(mutation, {
      id: id,
    });
    return data;
  } catch (e) {
    throw new functions.https.HttpsError('invalid-argument', e.message);
  }
});

exports.registerUser = functions.https.onCall(async (data) => {
  const { email, password } = data;
  if (email === null || password === null) {
    // We are throwing an error if either the email or the password is missing
    throw new functions.https.HttpsError(
      'invalid-argument',
      'email and password are required fields'
    );
  }

  try {
    // We create our user using the firebase admin sdk
    const userRecord = await admin.auth().createUser({ email, password });

    // We set our user role and the x-hasura-user-id claims
    // Remember, the x-hasura-user-id is what Hasura uses to check
    // if the user is allow to read/update a record
    const customClaims = {
      'https://hasura.io/jwt/claims': {
        'x-hasura-default-role': 'user',
        'x-hasura-allowed-roles': ['user'],
        'x-hasura-user-id': userRecord.uid,
      },
    };

    await admin.auth().setCustomUserClaims(userRecord.uid, customClaims);
    const user = userRecord.toJSON();

    const { uid: id, email: uEmail } = user;
    const mutation = `
      mutation($id: String!, $email: String) {
        insert_users(objects: [{
          id: $id,
          email: $email,
        }]) {
          affected_rows
        }
      }
    `;
    const data = await client.request(mutation, { id, email: uEmail });

    return data;
  } catch (e) {
    let errorCode = 'unknown';
    let msg = 'Something went wrong, please try again later';
    if (e.code === 'auth/email-already-exists') {
      // If a user that already has an account tries to sign up
      // we want to show them a proper error and instruct them to log in
      errorCode = 'already-exists';
      msg = e.message;
    }
    throw new functions.https.HttpsError(errorCode, msg, JSON.stringify(e));
  }
});
