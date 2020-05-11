ALTER TABLE Roles
ADD [Messages] bit NOT NULL default 1
GO

ALTER TABLE Roles
ADD Invites bit NOT NULL default 1
GO

ALTER TABLE Roles
ADD Instruments bit NOT NULL default 1
GO