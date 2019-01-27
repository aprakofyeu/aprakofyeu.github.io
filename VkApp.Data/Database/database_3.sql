USE [VkAppDb]
GO

ALTER TABLE dbo.[UserSavedMessages]
ADD [OrderIndex] int NOT NULL DEFAULT(0)
GO

ALTER TABLE dbo.[UserSavedMessages]
DROP CONSTRAINT [PK_UserSavedMessages]
GO

ALTER TABLE dbo.[UserSavedMessages]
ADD CONSTRAINT [PK_UserSavedMessages] PRIMARY KEY ([VkUserId], [TargetGroupId], [OrderIndex])
GO