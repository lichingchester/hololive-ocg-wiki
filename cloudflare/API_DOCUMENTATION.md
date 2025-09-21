# Hololive OCG Wiki API Documentation

This document describes the REST API endpoints provided by the Cloudflare Worker for the Hololive OCG Wiki.

## Base URL

```
https://your-worker-domain.workers.dev
```

## CORS Configuration

All endpoints support CORS with the following headers:

- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

## Authentication

No authentication is required for any endpoints.

## Endpoints

### 1. Search Cards

**Endpoint:** `GET /api/cards/search`

**Description:** Search for cards using full-text search (FTS) or fallback to pattern matching.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | string | Yes | - | Search query string |
| `locale` | string | No | `"en"` | Language locale (e.g., "en", "ja") |
| `limit` | number | No | `100` | Maximum number of results to return |

**Example Request:**

```http
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

### 2. Filter Cards

**Endpoint:** `GET /api/cards/filter`

**Description:** Filter cards using multiple criteria with pagination support.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `search` | string | No | - | General search term |
| `name` | string | No | - | Exact card name match |
| `tag` | string | No | - | Filter by specific tag |
| `set` | string | No | - | Filter by card set |
| `colors` | string | No | - | Comma-separated color codes (e.g., "RED,BLUE") |
| `cardTypes` | string | No | - | Comma-separated card type codes |
| `rarity` | string | No | - | Comma-separated rarity codes |
| `bloomLevel` | string | No | - | Comma-separated bloom level codes |
| `locale` | string | No | `"en"` | Language locale |
| `page` | number | No | `1` | Page number for pagination |
| `limit` | number | No | `50` | Number of results per page |

**Example Request:**

```http
GET /api/cards/filter?colors=RED,BLUE&rarity=RR,SR&page=1&limit=20&locale=en
```

**Response:**

```json
{
  "cards": [
    {
      "id": "card_id_1",
      "cardNumber": "HOL-001"
      // ... (same card structure as search endpoint)
    }
  ],
  "total": 150
}
```

### 3. Get Card Details

**Endpoint:** `GET /api/cards/{cardId}`

**Description:** Retrieve detailed information for a specific card, including all translations, arts, oshi skills, and Q&A items.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `cardId` | string | Yes | Unique card identifier |

**Example Request:**

```http
GET /api/cards/card_id_1
```

**Response:**

```json
{
  "card": {
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
        "set": "Debut Set",
        "abilityText": "Card ability description",
        "extra": "Additional information",
        "oshiSkill": {
          "cost": "2",
          "timingCode": "MAIN",
          "name": "Oshi Skill Name",
          "effect": "Oshi skill effect description"
        },
        "spOshiSkill": {
          "cost": "3",
          "timingCode": "MAIN",
          "name": "SP Oshi Skill Name",
          "effect": "SP Oshi skill effect description"
        },
        "arts": [
          {
            "costCount": 2,
            "costTypes": ["RED"],
            "damage": 50,
            "isPlus": true,
            "specialTargets": ["MEMBER"],
            "specialValues": ["100"],
            "name": "Art Name",
            "effect": "Art effect description"
          }
        ],
        "qa_items": [
          {
            "title": "Q&A Title",
            "question": "Question text",
            "answer": "Answer text",
            "relatedCardsHtml": "<html>Related cards</html>",
            "relatedCardNumbers": ["HOL-002", "HOL-003"]
          }
        ]
      }
    },
    "keyword": {
      "type": "Keyword Type",
      "typeCode": "KEYWORD_CODE"
    }
  }
}
```

### 4. Get Filter Options

**Endpoint:** `GET /api/filter-options`

**Description:** Retrieve dynamic filter options like card names, tags, and sets for a specific locale.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `locale` | string | No | `"en"` | Language locale |

**Example Request:**

```http
GET /api/filter-options?locale=en
```

**Response:**

```json
{
  "names": [
    { "value": "Card Name 1", "label": "Card Name 1" },
    { "value": "Card Name 2", "label": "Card Name 2" }
  ],
  "tags": [
    { "value": "hololive", "label": "hololive" },
    { "value": "debut", "label": "debut" }
  ],
  "sets": [
    { "value": "Debut Set", "label": "Debut Set" },
    { "value": "First Set", "label": "First Set" }
  ]
}
```

### 5. Get Static Filters

**Endpoint:** `GET /api/static-filters`

**Description:** Retrieve static filter options that don't depend on locale (card types, colors, rarities, bloom levels).

**Example Request:**

```http
GET /api/static-filters
```

**Response:**

```json
{
  "cardTypes": [
    { "value": "MEMBER", "label": "MEMBER" },
    { "value": "SUPPORT", "label": "SUPPORT" }
  ],
  "colors": [
    { "value": "RED", "label": "RED" },
    { "value": "BLUE", "label": "BLUE" },
    { "value": "GREEN", "label": "GREEN" }
  ],
  "rarities": [
    { "value": "C", "label": "C" },
    { "value": "R", "label": "R" },
    { "value": "RR", "label": "RR" },
    { "value": "SR", "label": "SR" }
  ],
  "bloomLevels": [
    { "value": "DEBUT", "label": "DEBUT" },
    { "value": "FIRST", "label": "FIRST" },
    { "value": "SECOND", "label": "SECOND" }
  ]
}
```

## Data Types

### Card Object

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

### CardTranslation Object

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

### OshiSkill Object

```typescript
interface OshiSkill {
  cost: string;
  timingCode: string;
  name: string;
  effect: string;
}
```

### Art Object

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

### QAItem Object

```typescript
interface QAItem {
  title: string;
  question: string;
  answer: string;
  relatedCardsHtml: string;
  relatedCardNumbers: string[];
}
```

### Keyword Object

```typescript
interface Keyword {
  type: string;
  typeCode: string;
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request

```json
{
  "error": "Card ID required"
}
```

### 404 Not Found

```json
{
  "error": "Card not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

## Notes

1. **Full-Text Search (FTS)**: The search functionality attempts to use FTS tables first for better performance. If FTS tables are not available, it falls back to LIKE pattern matching.

2. **JSON Array Fields**: Some fields like `colorCodes`, `batonTouchTypes`, `cardSets`, and `tags` are stored as JSON arrays in the database and are automatically parsed into JavaScript arrays in the response.

3. **Pagination**: The filter endpoint supports pagination. Use `page` and `limit` parameters to control the results. The response includes a `total` field indicating the total number of matching records.

4. **Localization**: Most endpoints support a `locale` parameter to retrieve content in different languages. Default locale is "en" (English).

5. **CORS**: All endpoints are configured to allow cross-origin requests from any domain.

## Example Usage

### JavaScript/TypeScript

```javascript
// Search for cards
const searchCards = async (query, locale = "en") => {
  const response = await fetch(
    `/api/cards/search?q=${encodeURIComponent(query)}&locale=${locale}`
  );
  return response.json();
};

// Filter cards with pagination
const filterCards = async (filters, page = 1, limit = 50) => {
  const params = new URLSearchParams({
    ...filters,
    page: page.toString(),
    limit: limit.toString(),
  });
  const response = await fetch(`/api/cards/filter?${params}`);
  return response.json();
};

// Get card details
const getCard = async (cardId) => {
  const response = await fetch(`/api/cards/${cardId}`);
  return response.json();
};
```
