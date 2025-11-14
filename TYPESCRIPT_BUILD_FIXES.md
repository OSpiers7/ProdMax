# TypeScript Build Errors - Solutions

## Problem 1: Module Declaration Errors

**Error:** `could not find a declaration file for module 'express'`

**Root Cause:**
- `@types/express`, `@types/bcryptjs`, `@types/jsonwebtoken` are in `devDependencies`
- Render may run `npm install --production` which skips `devDependencies`
- TypeScript needs these type definitions during compilation

**Solution:**
Move `@types/*` packages to `dependencies` OR ensure Render installs devDependencies during build.

## Problem 2: AuthRequest Property Errors

**Error:** `property X does not exist on type 'AuthRequest'`

**Root Cause:**
- `AuthRequest` extends `Request`, but TypeScript might not be recognizing inherited properties
- Need to ensure proper type inheritance

**Solution:**
Verify `AuthRequest` properly extends Express `Request` and all properties are accessible.

