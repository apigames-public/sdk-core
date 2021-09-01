import {
  hasProperty, isArray, isDefined, isObject, isString,
} from '@apigames/json';
import {
  IRestClient, RestClient, RestClientOptions, RestClientResponse,
} from '@apigames/rest-client';
import {
  IResourceContainer,
  IResourceObject,
  ResourceFilterName,
  ResourceFilterValue,
  ResourceIncludeOption,
  ResourceSortOption,
  ResourcePathParams, SDKConfig, ResourceObjectClass, SDKException,
} from '..';

export default class ResourceContainer implements IResourceContainer {
  protected _data: IResourceObject | IResourceObject[];

  private _restClient: IRestClient;

  protected pathParams: ResourcePathParams;

  constructor(restClient?: IRestClient) {
    this._data = undefined;
    this._restClient = isDefined(restClient) ? restClient : new RestClient();
    this.pathParams = {};
  }

  // eslint-disable-next-line class-methods-use-this
  get data(): IResourceObject | IResourceObject[] {
    throw new Error('Property not implemented.');
  }

  get restClient(): IRestClient {
    return this._restClient;
  }

  get uri(): string {
    let uriPath = this.EndpointPath();

    // eslint-disable-next-line no-restricted-syntax
    for (const pathParam in this.pathParams) {
      if (hasProperty(this.pathParams, pathParam)) {
        uriPath = uriPath.replace(`{${pathParam}}`, this.pathParams[pathParam]);
      }
    }

    return uriPath;
  }

  // eslint-disable-next-line class-methods-use-this
  protected EndpointPath(): string {
    throw new Error('Property not implemented.');
  }

  protected ClearData() {
    this._data = undefined;
  }

  // eslint-disable-next-line class-methods-use-this
  isResourceObject(value: any): value is IResourceObject {
    return isObject(value);
  }

  // eslint-disable-next-line class-methods-use-this
  isResourceList(value: any): value is IResourceObject[] {
    return isArray(value);
  }

  protected LoadResourceData(resourceData: any): IResourceObject {
    if (hasProperty(resourceData, 'type') && isString(resourceData.type)) {
      const ResourceClass: ResourceObjectClass = SDKConfig().ResourceClass(resourceData.type);
      return new ResourceClass(this).LoadData(resourceData);
    }

    throw new SDKException('INVALID-RESOURCE-TYPE', 'The resource being loaded doesn\'t have the required resource type.');
  }

  protected DeserializeResponse(response: RestClientResponse) {
    this.ClearData();

    if (hasProperty(response.data, 'data')) {
      if (isArray(response.data.data)) {
        this._data = [];
        // eslint-disable-next-line no-restricted-syntax
        for (const resource of response.data.data) {
          this._data.push(this.LoadResourceData(resource));
        }
      } else if (isObject(response.data.data)) {
        this._data = this.LoadResourceData(response.data.data);
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this,no-unused-vars
  protected DeserializeErrors(response: RestClientResponse) {
    this.ClearData();
  }

  // eslint-disable-next-line class-methods-use-this
  Add(): IResourceObject {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line class-methods-use-this,no-unused-vars
  Delete(resource: IResourceObject): Promise<void> {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line class-methods-use-this
  Find(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async Get(id: string): Promise<boolean> {
    this.ClearData();
    const queryUri: string = `${this.uri}/${id}`;
    const queryHeaders = {
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    };
    const queryOptions: RestClientOptions = {};

    const response = await this._restClient.Get(queryUri, queryHeaders, queryOptions);

    switch (response.statusCode) {
      case 200:
        this.DeserializeResponse(response);
        return true;
      default:
        this.DeserializeErrors(response);
        return false;
    }
  }

  // eslint-disable-next-line class-methods-use-this,no-unused-vars
  IncludedObject(type: string, id: string): IResourceObject {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line class-methods-use-this,no-unused-vars
  Filter(filter: ResourceFilterName, value: ResourceFilterValue): IResourceContainer {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line class-methods-use-this,no-unused-vars
  Sort(option: ResourceSortOption): IResourceContainer {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line class-methods-use-this,no-unused-vars
  Include(include: ResourceIncludeOption): IResourceContainer {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line class-methods-use-this,no-unused-vars
  Page(pageNumber: number, pageSize: number): IResourceContainer {
    throw new Error('Method not implemented.');
  }
}
