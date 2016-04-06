# Transparant NL API

This API is a simplified version of the Histograph geocoding and dataset API, found [here](https://github.com/histograph/api).

To run the API locally, clone this repository and type:

    npm install
    node index.js

For more information about installing and running the complete Histograph stack, which we use for Transparant NL, see the [`histograph/installation`](https://github.com/histograph/installation) repository. All is relevant, except the API, which is replaced by this one.

## API specification

The Transparant NL API inherits the five endpoints from the histograph version:

| Endpoint                                    | Description
|---------------------------------------------|------------------------------------------
| [`/search`](#search-api)                    | Geocoding and search
| [`/datasets`](#datsets-api)                 | Datasets, PITs and relations
| [`/ontology`](#ontology-api)                | Histograph ontology
| [`/schemas`](#json-schemas-api)             | JSON schemas
| [`/stats`](#data-and-system-statistics-api) | Data and system statistics


And adds some more:

| Endpoint                                    | Description
|---------------------------------------------|------------------------------------------
| [`/relations`](#relations-api)              | Retrieve all relations from an Organization or Person
| [`/orgsFromPerson`](#orgsFromPerson-api)    | Retrieve all organizations a Person has had a relation with
| [`/peopleFromOrg`](#peopleFromOrg-api)      | Retrieve all people that have (had) a relation with an Organization
| [`/peopleFromOrgsFromPerson`](#pfofp-api)   | Retrieve all people that have (had) a relation with organizations that a person has (had) a relationship with
| [`/equivalentIDs`](#equivalentIDs-api)      | Retrieve all ID's of people or organizations that have an equivalence relation with a particular node
| [`/shortestPath`](#shortestpath-api)        | Retrieve the shortest path between two PITs
| [`/reconcile`](#reconcile-api)              | [Open refine](http://openrefine.org/) reconciliation endpoint



### Search API

| Endpoint      | Description
|---------------|-----------------
| `GET /search` | Search for people and organizations

#### Results

Each Feature represents a [Histograph Concept](http://histograph.io/concepts#concepts). A Histograph Concept represents a single concept (i.e. a person, a political party, a sector, etc.), and consists of a set of [place-in-time objects (PITs)](http://histograph.io/concepts#place-in-time), connected by [`tnl:same` relations](http://histograph.io/concepts#relations). For more information about Concepts, PITs and relations, see [histograph.io](http://histograph.io/concepts).

#### Parameters

All API search calls expect at least one of the following parameters:

| Parameter    | Example                                    | Description
|--------------|--------------------------------------------|-----------------
| `id`         | `id=urn:hgid:pdc/shellnederland`           | Exact match on `id` (dataset internal)
| `q`          | `q=boskoop`                                | `uri` query if `q`'s value starts with `http`, `id` query if value contains `/`, `name` query otherwise
| `type`       | `type=tnl:Person`                          | Filter on PIT type (or comma-separated list of types). See the [Transparant Nederland ontology](https://api.transparantnederland.nl/ontology) for a list of valid types
| `dataset`    | `datset=pdc,kvk`                           | Filter on dataset ID (or comma-separated list of IDs)


### Datasets API

| Endpoint                                  | Data      | Description
|-------------------------------------------|-----------|-------------------------------
| `GET /datasets`                           |           | All dataset available via Histograph
| `GET /datasets/:dataset`                  |           | Metadata of single dataset
| `GET /datasets/:dataset/pits`             |           | All PITs of single dataset
| `GET /datasets/:dataset/relations`        |           | All relations of single dataset
| `POST /datasets`                          | Dataset   | Create new, empty dataset
| `PATCH /datasets/:dataset`                | Dataset   | Update existing dataset
| `PUT /datasets/:dataset/pits`             | PITs      | Update all pits of single dataset
| `PUT /datasets/:dataset/relations`        | Relations | Update all relations of single dataset
| `DELETE /datasets/:dataset`               |           | Delete a dataset completely

#### Data

| Type      | Format                       | MIME type              | JSON schema
|-----------|------------------------------|------------------------|------------
| Dataset   | JSON                         | `application/json`     | [`dataset.schema.json`](https://github.com/histograph/schemas/tree/master/json-schemas/dataset.schema.json)
| PITs      | [NDJSON](http://ndjson.org/) | `application/x-ndjson` | [`pits.schema.json`](https://github.com/histograph/schemas/tree/master/json-schemas/pits.schema.json)
| Relations | [NDJSON](http://ndjson.org/) | `application/x-ndjson` | [`relations.schema.json`](https://github.com/histograph/schemas/tree/master/json-schemas/relations.schema.json)

You can send NDJSON data in your PUT request's body when you are uploading a small data set (i.e. less than 5MB). For bigger NDJSON files, you can use `multipart/form-data` file upload.

#### Authentication

All `POST`, `PATCH`, `PUT` and `DELETE` requests require [basic authentication](http://en.wikipedia.org/wiki/Basic_access_authentication) via HTTPS.

### Ontology API

| Endpoint        | Description
|-----------------|--------------------------------
| `GET /ontology` | Transparant Nederland Turtle/N3 RDF ontology, all types and relations

### JSON schemas API

| Endpoint                 | Description
|--------------------------|--------------------------------
| `GET /schemas/pits`      | [JSON schema](http://json-schema.org/) for PITs
| `GET /schemas/relations` | JSON schema for relations

### Data and system statistics API

| Endpoint             | Description
|----------------------|--------------------------------
| `GET /stats/queue`   | Queue length
| `GET /stats/queries` | Results of [data statistics queries](https://github.com/histograph/stats/tree/master/queries) (executed every _n_ hours)

### ShortestPath API

| Endpoint            | Description
|---------------------|-----------------
| `GET /shortestPath` | Return the shortest path between two PITs

#### Parameters

This endpoint requires parameters:

| Parameter    | Example                                    | Description
|--------------|--------------------------------------------|-----------------
| `id`         | `id=urn:hgid:pdc/shellnederland`           | From PIT
| `related.id` | `id=urn:hgid:pdc/vvd`                      | TO PIT

### Reconcile API

We have an endpoint that supports integration with [Open Refine](openrefine.org). Unfortunately, our [SSL certificate provider](https://letsencrypt.org/) is not trusted by default by the included JDK. There are two ways to fix this:


1. Manually add this certificate to your keystore in order to use this service.

  First, download the certificate:

  ```sh
  echo -n | openssl s_client -connect api.transparantnederland.nl:443 | sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > ~/api.transparantnederland.nl.crt
  ```

  Then, add it to your Open Refine JDK keystore, where `$JAVA_HOME` is the location of the JDK (e.g. `/opt/homebrew-cask/Caskroom/openrefine-dev/2.6-rc.2/OpenRefine.app/Contents/PlugIns/jdk1.8.0_60.jdk/Contents/Home/`):

  ```sh
  keytool -trustcacerts -keystore $JAVA_HOME/jre/lib/security/cacerts -storepass changeit -noprompt -importcert -file ~/api.transparantnederland.nl.cer
  ```

2. Use an other endpoint (could stop working at a later point).

  Currently the reconciliation service is also available under http://api.transparantnederland.nl:3001/reconcile.

| Endpoint             | Description
|----------------------|--------------------------------
| `GET /reconcile`     | Reconcile service metadata
| `POST /reconcile`    | Results of query request


Copyright (C) 2016 [Waag Society](http://waag.org).
