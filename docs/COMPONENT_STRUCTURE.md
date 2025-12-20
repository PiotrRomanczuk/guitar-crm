# Component Directory Structure

For domain-specific component directories (e.g., `lessons`, `assignments`, `songs`, `users`), use the following standard structure to maintain consistency and organization.

## Directory Layout

```
components/[domain]/
├── actions/           # Standalone action components (buttons, dialog triggers)
│   ├── [Domain]DeleteButton.tsx
│   └── [Specific]Action.tsx
├── details/           # Components for the detailed view of a single entity
│   ├── [Domain]DetailsCard.tsx
│   └── [Related]List.tsx
├── form/              # Components related to creating or editing the entity
│   ├── [Domain]Form.tsx
│   ├── [Domain]Form.Fields.tsx
│   └── [Domain]Form.Actions.tsx
├── hooks/             # Custom hooks specific to this domain
│   ├── use[Domain]List.ts
│   └── use[Domain]Form.ts
├── list/              # Components related to listing the entities
│   ├── [Domain]List.tsx
│   ├── [Domain]Table.tsx
│   ├── [Domain]List.Filter.tsx
│   └── [Domain]List.Header.tsx
├── [sub-domain]/      # (Optional) Components related to a specific sub-relation
│   └── ...
├── index.ts           # Public API exporting components from subdirectories
└── types/             # (Optional) Local type definitions
```

## Guidelines

1.  **Grouping**: Group files by their functional role (Form, List, Details) rather than flat lists.
2.  **Exports**: Use `index.ts` to export components so imports remain clean (e.g., `import { LessonForm } from '@/components/lessons'`).
3.  **Hooks**: Keep logic separated in the `hooks/` directory.
4.  **Actions**: Isolate buttons that perform actions (delete, send email) in `actions/` to make them reusable and easy to find.
