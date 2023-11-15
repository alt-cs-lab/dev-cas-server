This is a lightweight development authentication server implementing the [CAS 2.0 Protocol](https://apereo.github.io/cas/6.6.x/protocol/CAS-Protocol-V2-Specification.html). It is intended to be used in a development environment to quickly develop applications that need to authenticate against a CAS server.

**DO NOT USE IN PRODUCTION**

This server is *only* for development use - as it will allow any username to be authenticated, provided the password used is **password**.  Any other username/password combination will be authenticated.

As you can see, this allows you to easily create and authenticate multiple users for your application as you are developing it.  

By default this server runs on port 4050. You can change that by setting a PORT environment variable.

