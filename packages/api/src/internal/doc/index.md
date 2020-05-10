# Too much artisans API

This API is based on the data exposed in : [https://github.com/keycap-archivist/database](https://github.com/keycap-archivist/database)

## API

Database version of the API: {SHA_API_VERSION}

### GraphQl

- graphQl endpoint : [https://artisans.mechanical-keyboards.fr/api/graphql](https://artisans.mechanical-keyboards.fr/api/graphql)

```graphql
{gql-content}
```

### Wishlist Generator

[https://artisans.mechanical-keyboards.fr/api/v1](https://artisans.mechanical-keyboards.fr/api/v1)

Available through querystring

```
ids : id list separated by comma. eg : 10,12,13
bg : HexColor without #. eg : FF00F0
title : string
titlecolor: HexColor without #
textcolor : HexColor without #
```

example: https://artisans.mechanical-keyboards.fr/api/v1?ids=702c4f18,f733ff0b,486a0062,f77bfea4,e951b800,df6cb5ab&title=Zekth-Wishlist

Generates:

<center>
<img src="https://artisans.mechanical-keyboards.fr/api/v1?ids=702c4f18,f733ff0b,486a0062,f77bfea4,e951b800,df6cb5ab&title=Zekth-Wishlist">
</center>
