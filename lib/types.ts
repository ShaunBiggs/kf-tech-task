export type Outage = {
  id: string;
  begin: string;
  end: string;
};

export type GetOutagesResponse = Outage[];

export type Device = {
  id: string;
  name: string;
};

export type GetSiteInfoResponse = {
  id: string;
  name: string;
  devices: Device[];
};

export type DeviceOutage = Outage & { name: string };

export type SiteOutagesRequest = DeviceOutage[];
