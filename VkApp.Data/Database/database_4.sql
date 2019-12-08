USE [VkAppDb]
GO

CREATE TABLE [dbo].[StatisticsGroup](
	[TargetGroupId] [int] NOT NULL,
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](255) NOT NULL,
 CONSTRAINT [PK_StatisticsGroup] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[StatisticsGroupUsers](
	[StatisticsGroupId] [int] NOT NULL,
	[UserId] [int] NOT NULL
) ON [PRIMARY]
GO


