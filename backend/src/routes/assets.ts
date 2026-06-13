import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import * as store from '../store';
import { validateAssetInput, ValidationError } from '../validate';
import { AssetStatus, AssetType, ListFilters } from '../types';

const router = Router();

//Middleware
function validateBody(requireAll: boolean): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      validateAssetInput(req.body, requireAll);
      next();
    } catch (err) {
      if (err instanceof ValidationError) {
        res.status(422).json({ error: 'Validation failed', fields: err.fields });
        return;
      }
      next(err);
    }
  };
}

router.get('/', (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
  const limit = Math.min(200, Math.max(1, parseInt(String(req.query.limit ?? '50'), 10) || 50));

  const filters: ListFilters = { page, limit };

  if (req.query.type) filters.type = req.query.type as AssetType;
  if (req.query.status) filters.status = req.query.status as AssetStatus;

  if (req.query.bbox) {
    const parts = String(req.query.bbox).split(',').map(Number);
    if (parts.length !== 4 || parts.some(isNaN)) {
      res.status(400).json({ error: 'bbox must be minLng,minLat,maxLng,maxLat' });
      return;
    }
    const [minLng, minLat, maxLng, maxLat] = parts;
    filters.bbox = { minLng, minLat, maxLng, maxLat };
  }

  res.json(store.list(filters));
});

router.get('/:id', (req: Request, res: Response) => {
  const asset = store.findById(req.params.id);
  if (!asset) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json({ data: asset });
});

router.post('/', validateBody(true), (req: Request, res: Response) => {
  const asset = store.create(req.body);
  res.status(201).json({ data: asset });
});

router.put('/:id', validateBody(false), (req: Request, res: Response) => {
  const asset = store.update(req.params.id, req.body);
  if (!asset) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json({ data: asset });
});

router.delete('/:id', (req: Request, res: Response) => {
  const deleted = store.remove(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.status(204).send();
});

export default router;
