// BACKUP FILE - Original version before Select fix
// This file contains the original problematic Select usage with empty string values
// Created for rollback purposes if needed

// Original problematic line was:
// <SelectItem value="">Yönetici seçilmedi</SelectItem>

// This caused the runtime error:
// "A <Select.Item /> must have a value prop that is not an empty string"

// The fix replaced empty string with "none" value and proper handling logic
