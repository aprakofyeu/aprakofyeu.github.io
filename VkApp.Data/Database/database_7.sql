CREATE TABLE [dbo].[Invites](
	[UserId] [int] NOT NULL,
	[GroupId] [int] NOT NULL,
	[InvitedUserId] [int] NOT NULL,
	[Timestamp] [date] NOT NULL,
 CONSTRAINT [PK_Invites] PRIMARY KEY CLUSTERED 
(
	[UserId] ASC,
	[GroupId] ASC,
	[InvitedUserId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO


