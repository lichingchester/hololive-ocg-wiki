# API Documentation

REST API reference for the Hololive OCG Wiki Cloudflare Worker.

## Base URL

```
https://hololive-ocg-wiki.lichingchester.dev
```

## Authentication

No authentication required.

## CORS

All endpoints support CORS:

- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

---

## Endpoints

### 1. Search Cards

`GET /api/cards/search`

Full-text search using FTS5, with fallback to LIKE pattern matching.

| Parameter | Type   | Required | Default | Description     |
| --------- | ------ | -------- | ------- | --------------- |
| `q`       | string | Yes      | —       | Search query    |
| `locale`  | string | No       | `"en"`  | Language locale |
| `limit`   | number | No       | `100`   | Max results     |

**Example:**

```
GET /api/cards/search?q=hololive&locale=en&limit=50
```

**Response:**

```json
{
  "cards": [
    {
      "id": "card_id_1",
      "cardNumber": "HOL-001",
      "cardTypeCode": "MEMBER",
      "colorCodes": ["RED", "BLUE"],
      "rarityCode": "RR",
      "bloomLevelCode": "DEBUT",
      "imagePath": "/images/card1.jpg",
      "imageUrl": "https://example.com/images/card1.jpg",
      "hp": 100,
      "life": 1,
      "batonTouchCount": 2,
      "batonTouchTypes": ["RED"],
      "illustrator": "Artist Name",
      "cardSets": ["Set 1"],
      "tags": ["hololive", "debut"],
      "translations": {
        "en": {
          "name": "Card Name",
          "cardType": "Member",
          "color": "Red/Blue",
          "rarity": "Double Rare",
          "abilityText": "Card ability description"
        }
      }
    }
  ]
}
```

---

### 2. Filter Cards

`GET /api/cards/filter`

Multi-criteria filtering with pagination.

| Parameter    | Type   | Required | Default | Description                       |
| ------------ | ------ | -------- | ------- | --------------------------------- |
| `search`     | string | No       | —       | General search term               |
| `name`       | string | No       | —       | Exact card name match             |
| `tag`        | string | No       | —       | Filter by tag                     |
| `set`        | string | No       | —       | Filter by card set                |
| `colors`     | string | No       | —       | Comma-separated color codes       |
| `cardTypes`  | string | No       | —       | Comma-separated card type codes   |
| `rarity`     | string | No       | —       | Comma-separated rarity codes      |
| `bloomLevel` | string | No       | —       | Comma-separated bloom level codes |
| `locale`     | string | No       | `"en"`  | Language locale                   |
| `page`       | number | No       | `1`     | Page number                       |
| `limit`      | number | No       | `50`    | Results per page                  |

**Example:**

```
GET /api/cards/filter?colors=RED,BLUE&rarity=RR,SR&page=1&limit=20&locale=en
```

**Response:**

```json
{
  "cards": [ ... ],
  "total": 150
}
```

---

### 3. Get Card Details

`GET /api/cards/{cardId}`

Detailed card info including all translations, arts, oshi skills, and Q&A.

| Parameter | Type   | Required | Description           |
| --------- | ------ | -------- | --------------------- |
| `cardId`  | string | Yes      | Unique card ID (path) |

**Example:**

```
GET /api/cards/card_id_1
```

**Response:**

```json
{
  "card": {
    "id": "card_id_1",
    "cardNumber": "HOL-001",
    "translations": {
      "en": {
        "name": "Card Name",
        "oshiSkill": {
          "cost": "2",
          "timingCode": "MAIN",
          "name": "Skill",
          "effect": "..."
        },
        "spOshiSkill": {
          "cost": "3",
          "timingCode": "MAIN",
          "name": "SP Skill",
          "effect": "..."
        },
        "arts": [
          {
            "costCount": 2,
            "costTypes": ["RED"],
            "damage": 50,
            "isPlus": true,
            "name": "Art",
            "effect": "..."
          }
        ],
        "qa_items": [
          {
            "title": "Q&A",
            "question": "...",
            "answer": "...",
            "relatedCardNumbers": ["HOL-002"]
          }
        ]
      }
    },
    "keyword": { "type": "Keyword Type", "typeCode": "KEYWORD_CODE" }
  }
}
```

---

### 4. Get Filter Options

`GET /api/filter-options`

Dynamic filter options (names, tags, sets) for a locale.

| Parameter | Type   | Required | Default | Description     |
| --------- | ------ | -------- | ------- | --------------- |
| `locale`  | string | No       | `"en"`  | Language locale |

**Response:**

```json
{
  "names": [{ "value": "Card Name 1", "label": "Card Name 1" }],
  "tags": [{ "value": "hololive", "label": "hololive" }],
  "sets": [{ "value": "Debut Set", "label": "Debut Set" }]
}
```

---

### 5. Get Static Filters

`GET /api/static-filters`

Static filter values (card types, colors, rarities, bloom levels). Not locale-dependent.

**Response:**

```json
{
  "cardTypes": [{ "value": "MEMBER", "label": "MEMBER" }],
  "colors": [{ "value": "RED", "label": "RED" }],
  "rarities": [{ "value": "C", "label": "C" }],
  "bloomLevels": [{ "value": "DEBUT", "label": "DEBUT" }]
}
```

---

## Data Types

### Card

```typescript
interface Card {
  id: string;
  cardNumber: string;
  cardTypeCode: string;
  colorCodes: string[];
  rarityCode: string;
  bloomLevelCode?: string;
  imagePath: string;
  imageUrl: string;
  hp?: number;
  life?: number;
  batonTouchCount?: number;
  batonTouchTypes?: string[];
  illustrator?: string;
  cardSets?: string[];
  tags?: string[];
  translations: Record<string, CardTranslation>;
  oshiSkill?: OshiSkill;
  spOshiSkill?: OshiSkill;
  arts?: Art[];
  keyword?: Keyword;
}
```

### CardTranslation

```typescript
interface CardTranslation {
  name: string;
  cardType: string;
  color: string;
  rarity: string;
  set: string;
  abilityText: string;
  extra?: string;
  oshiSkill?: OshiSkill;
  spOshiSkill?: OshiSkill;
  arts?: Art[];
  qa_items?: QAItem[];
}
```

### OshiSkill

```typescript
interface OshiSkill {
  cost: string;
  timingCode: string;
  name: string;
  effect: string;
}
```

### Art

```typescript
interface Art {
  costCount: number;
  costTypes: string[];
  damage: number;
  isPlus: boolean;
  specialTargets: string[];
  specialValues: string[];
  name: string;
  effect: string;
}
```

### QAItem

```typescript
interface QAItem {
  title: string;
  question: string;
  answer: string;
  relatedCardsHtml: string;
  relatedCardNumbers: string[];
}
```

---

## Error Responses

| Status | Body                                   |
| ------ | -------------------------------------- |
| 400    | `{ "error": "Card ID required" }`      |
| 404    | `{ "error": "Card not found" }`        |
| 500    | `{ "error": "Internal server error" }` |

## Notes

- **FTS fallback:** Search tries FTS5 first, falls back to LIKE if unavailable.
- **JSON arrays:** Fields like `colorCodes`, `cardSets`, `tags` are stored as JSON strings in D1 and parsed in the response.
- **Pagination:** Use `page` + `limit` on the filter endpoint. Response includes `total` count.
- **Localization:** Most endpoints accept `locale`. Default is `"en"`.

## Example Usage

```javascript
// Search
const res = await fetch(
  `/api/cards/search?q=${encodeURIComponent(query)}&locale=en`,
);
const { cards } = await res.json();

// Filter with pagination
const params = new URLSearchParams({
  colors: "RED",
  page: "1",
  limit: "20",
  locale: "en",
});
const res = await fetch(`/api/cards/filter?${params}`);
const { cards, total } = await res.json();
```

## Related

- [[Deployment/Worker Service|Worker Service]] — Worker deployment and configuration
- [[Database/Full-Text Search|Full-Text Search]] — FTS setup details
- [[Database/Schema & Migrations|Schema & Migrations]] — Database schema reference
