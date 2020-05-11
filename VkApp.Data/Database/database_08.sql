ALTER TABLE [dbo].[User]
DROP CONSTRAINT [DF__User__SendInterv__07F6335A]
ALTER TABLE [dbo].[User]
DROP COLUMN SendInterval
GO

ALTER TABLE [dbo].[User]
DROP CONSTRAINT [DF__User__SaveLastMe__08EA5793]
ALTER TABLE [dbo].[User]
DROP COLUMN SaveLastMessage
GO

ALTER TABLE [dbo].[User]
ADD InvitesInterval int NOT NULL
CONSTRAINT D_User_InvitesInterval
DEFAULT (50)
GO


