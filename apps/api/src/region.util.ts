// 业务上定义用户数据属地：us 或 eu，最终映射到 DB 区域键
export type UserGeo = 'us' | 'eu';

export function inferUserGeo(headers: Record<string, any>): UserGeo {
  // 优先：手动选择（X-User-Geo），否则粗略按 CF-IPCountry
  const forced = (headers['x-user-geo'] || headers['X-User-Geo']) as string;
  if (forced?.toLowerCase() === 'eu') return 'eu';
  if (forced?.toLowerCase() === 'us') return 'us';

  const country = (headers['cf-ipcountry'] || headers['CF-IPCountry'] || '').toString().toUpperCase();
  // 简化：欧盟/欧洲常见国家，非精确名单，可随政策扩展
  const euCountries = new Set(['DE','FR','NL','BE','IT','ES','SE','PL','AT','DK','FI','IE','PT','CZ','HU','RO','SK','BG','HR','SI','EE','LV','LT','LU','MT','GR','CY']);
  return euCountries.has(country) ? 'eu' : 'us';
}

// 将 us/eu 映射为 Cockroach 集群 region key（与你的集群命名保持一致）
export function mapGeoToCrdbRegion(geo: UserGeo): string {
  return geo === 'eu' ? 'eu-central' : 'us-east'; // 如你的集群命名不同，请对应修改
}
