# Too much artisans API

This API is based on the data exposed in : [https://github.com/zekth/too-much-artisans-db](https://github.com/zekth/too-much-artisans-db)

## API



### GraphQl

- graphQl endpoint : [http://too-much-artisans.westeurope.azurecontainer.io/graphql](http://too-much-artisans.westeurope.azurecontainer.io/graphql)

```graphql
{gql-content}
```

### Wishlist Generator

[http://too-much-artisans.westeurope.azurecontainer.io/api/v1](http://too-much-artisans.westeurope.azurecontainer.io/api/v1)

Available through querystring

```
ids : id list separated by comma. eg : 10,12,13
bg : HexColor without #. eg : FF00F0
title : string
titlecolor: HexColor without #
textcolor : HexColor without #
```

example:  http://too-much-artisans.westeurope.azurecontainer.io/api/v1?ids=702c4f18,f733ff0b,486a0062,f77bfea4,e951b800,df6cb5ab&title=Zekth-Wishlist

Generates:
<center>
<img src="http://too-much-artisans.westeurope.azurecontainer.io/api/v1?ids=702c4f18,f733ff0b,486a0062,f77bfea4,e951b800,df6cb5ab&title=Zekth-Wishlist">
</center>
