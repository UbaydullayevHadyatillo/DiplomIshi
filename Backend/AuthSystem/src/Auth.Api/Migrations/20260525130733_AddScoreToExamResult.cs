using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Auth.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddScoreToExamResult : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TestResult_ExamResults_ExamResultId",
                table: "TestResult");

            migrationBuilder.DropForeignKey(
                name: "FK_TestResult_Questions_QuestionId",
                table: "TestResult");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TestResult",
                table: "TestResult");

            migrationBuilder.DropIndex(
                name: "IX_TestResult_QuestionId",
                table: "TestResult");

            migrationBuilder.DropColumn(
                name: "SelectedOptionId",
                table: "TestResult");

            migrationBuilder.RenameTable(
                name: "TestResult",
                newName: "TestResults");

            migrationBuilder.RenameColumn(
                name: "Percentage",
                table: "ExamResults",
                newName: "Score");

            migrationBuilder.RenameColumn(
                name: "FinishedAt",
                table: "ExamResults",
                newName: "TakenAt");

            migrationBuilder.RenameIndex(
                name: "IX_TestResult_ExamResultId",
                table: "TestResults",
                newName: "IX_TestResults_ExamResultId");

            migrationBuilder.AddColumn<string>(
                name: "SelectedOptionIds",
                table: "TestResults",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TestResults",
                table: "TestResults",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TestResults_ExamResults_ExamResultId",
                table: "TestResults",
                column: "ExamResultId",
                principalTable: "ExamResults",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TestResults_ExamResults_ExamResultId",
                table: "TestResults");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TestResults",
                table: "TestResults");

            migrationBuilder.DropColumn(
                name: "SelectedOptionIds",
                table: "TestResults");

            migrationBuilder.RenameTable(
                name: "TestResults",
                newName: "TestResult");

            migrationBuilder.RenameColumn(
                name: "TakenAt",
                table: "ExamResults",
                newName: "FinishedAt");

            migrationBuilder.RenameColumn(
                name: "Score",
                table: "ExamResults",
                newName: "Percentage");

            migrationBuilder.RenameIndex(
                name: "IX_TestResults_ExamResultId",
                table: "TestResult",
                newName: "IX_TestResult_ExamResultId");

            migrationBuilder.AddColumn<int>(
                name: "SelectedOptionId",
                table: "TestResult",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddPrimaryKey(
                name: "PK_TestResult",
                table: "TestResult",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_TestResult_QuestionId",
                table: "TestResult",
                column: "QuestionId");

            migrationBuilder.AddForeignKey(
                name: "FK_TestResult_ExamResults_ExamResultId",
                table: "TestResult",
                column: "ExamResultId",
                principalTable: "ExamResults",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TestResult_Questions_QuestionId",
                table: "TestResult",
                column: "QuestionId",
                principalTable: "Questions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
